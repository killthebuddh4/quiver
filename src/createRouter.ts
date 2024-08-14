import * as Brpc from "./types/brpc.js";
import { jsonStringSchema } from "./lib/jsonStringSchema.js";
import { Topic } from "./types/Topic.js";
import { RouterOptions } from "./types/RouterOptions.js";
import { Publish } from "./types/Publish.js";
import { Subscribe } from "./types/Subscribe.js";

export const createRouter = (args: {
  api: { [key: string]: Brpc.BrpcProcedure | undefined };
  topic: Topic;
  publish: Publish;
  subscribe: Subscribe;
  options?: RouterOptions;
}) => {
  const start = () => {
    const sub = args.subscribe(async (message) => {
      if (
        message.conversation.context?.conversationId !==
        args.topic.context.conversationId
      ) {
        if (args.options?.onTopicMismatch) {
          try {
            args.options.onTopicMismatch({ message });
          } catch {
            console.warn("onSkippedMessage threw an error");
          }
        }

        return;
      }

      if (args.options?.onReceivedMessage) {
        try {
          args.options.onReceivedMessage({ message });
        } catch {
          console.warn("onReceivedMessage threw an error");
        }
      }

      if (message.senderAddress === args.topic.peerAddress) {
        if (args.options?.onSelfSentMessage) {
          try {
            args.options.onSelfSentMessage({ message });
          } catch {
            console.warn("onSelfSentMessage threw an error");
          }
        }

        return;
      }

      const json = jsonStringSchema.safeParse(message.content);

      if (!json.success) {
        if (args.options?.onReceivedInvalidJson) {
          try {
            args.options.onReceivedInvalidJson({ message });
          } catch {
            console.warn("onReceivedInvalidJson threw an error");
          }
        }
        return;
      }

      const request = Brpc.brpcRequestSchema.safeParse(json.data);

      if (!request.success) {
        if (args.options?.onReceivedInvalidRequest) {
          try {
            args.options.onReceivedInvalidRequest({ message });
          } catch {
            console.warn("onReceivedInvalidRequest threw an error");
          }
        }
        return;
      }

      const respond = async (str: string) => {
        if (args.options?.onSendingResponse) {
          try {
            args.options.onSendingResponse();
          } catch {
            console.warn("onSendingResponse threw an error)");
          }
        }

        try {
          const sent = await args.publish({
            topic: {
              peerAddress: message.senderAddress,
              context: args.topic.context,
            },
            content: str,
          });

          if (args.options?.onSentResponse) {
            try {
              args.options.onSentResponse({ sent: sent.published });
            } catch {
              console.warn("onResponseSent threw an error");
            }
          }
        } catch (error) {
          if (args.options?.onSendResponseError) {
            try {
              args.options.onSendResponseError();
            } catch {
              console.warn("onSendFailed threw an error");
            }
          }
        }
      };

      const procedure = args.api[request.data.name];

      if (procedure === undefined) {
        if (args.options?.onUnknownProcedure) {
          try {
            args.options.onUnknownProcedure();
          } catch {
            console.warn("onUnknownProcedure threw an error");
          }
        }

        respond(
          JSON.stringify({
            id: request.data.id,
            payload: {
              ok: false,
              code: "UNKNOWN_PROCEDURE",
            },
          }),
        );

        return;
      }

      const context = {
        id: request.data.id,
        message: {
          id: message.id,
          senderAddress: message.senderAddress,
        },
      };

      let isAuthorized = false;

      try {
        isAuthorized = await procedure.auth({
          context,
        });
      } catch (error) {
        if (args.options?.onAuthError) {
          try {
            args.options.onAuthError();
          } catch (error) {
            console.warn("onAuthError threw an error", error);
          }
        }
        isAuthorized = false;
      }

      if (!isAuthorized) {
        if (args.options?.onUnauthorized) {
          try {
            args.options.onUnauthorized();
          } catch (error) {
            console.warn("onUnauthorized threw an error", error);
          }
        }

        respond(
          JSON.stringify({
            id: request.data.id,
            payload: {
              ok: false,
              code: "UNAUTHORIZED",
            },
          }),
        );

        return;
      }

      const input = procedure.input.safeParse(request.data.payload);

      if (!input.success) {
        if (args.options?.onInputTypeMismatch) {
          try {
            args.options.onInputTypeMismatch();
          } catch (error) {
            console.warn("onInputTypeMismatch threw an error", error);
          }
        }

        respond(
          JSON.stringify({
            id: request.data.id,
            payload: {
              ok: false,
              code: "INPUT_TYPE_MISMATCH",
            },
          }),
        );

        return;
      }

      let output;
      try {
        if (args.options?.onHandlingMessage) {
          try {
            args.options.onHandlingMessage();
          } catch (error) {
            console.warn("onHandlingMessage threw an error", error);
          }
        }

        output = await procedure.handler(input.data, context);
      } catch (error) {
        if (args.options?.onHandlerError) {
          try {
            args.options.onHandlerError();
          } catch (error) {
            console.warn("onHandlerError threw an error", error);
          }
        }

        respond(
          JSON.stringify({
            id: request.data.id,
            payload: {
              ok: false,
              code: "SERVER_ERROR",
            },
          }),
        );

        return;
      }

      let response: string;
      try {
        response = JSON.stringify({
          id: request.data.id,
          payload: {
            ok: true,
            code: "SUCCESS",
            data: output,
          },
        });
      } catch (error) {
        if (args.options?.onOutputSerializationError) {
          try {
            args.options.onOutputSerializationError();
          } catch (error) {
            console.warn("onOutputSerializationError threw an error", error);
          }
        }

        respond(
          JSON.stringify({
            id: request.data.id,
            payload: {
              ok: false,
              code: "OUTPUT_SERIALIZATION_FAILED",
            },
          }),
        );

        return;
      }

      respond(response);
    });

    return { stop: sub.unsubscribe };
  };

  return { start };
};
