import { z } from "zod";
import * as Brpc from "./types/brpc.js";
import { v4 as uuidv4 } from "uuid";
import { jsonStringSchema } from "./lib/jsonStringSchema.js";
import { Topic } from "./types/Topic.js";
import { ClientOptions } from "./types/ClientOptions.js";
import { Publish } from "./types/Publish.js";
import { Subscribe } from "./types/Subscribe.js";

export const createClient = <A extends Brpc.BrpcApi>(args: {
  api: A;
  publish: Publish;
  subscribe: Subscribe;
  topic: Topic;
  options?: ClientOptions;
}) => {
  const client = {};

  for (const [key, value] of Object.entries(args.api)) {
    (client as any)[key as keyof typeof args.api] = async (
      input: z.infer<typeof value.input>,
    ) => {
      const request = {
        id: uuidv4(),
        name: key,
        payload: input,
      };

      let str: string;
      try {
        str = JSON.stringify(request);
      } catch {
        if (args.options?.onInputSerializationError) {
          try {
            args.options.onInputSerializationError();
          } catch {
            console.warn("onInputSerializationError threw an error");
          }
        }

        return {
          ok: false,
          code: "INPUT_SERIALIZATION_FAILED",
          request,
          response: null,
        };
      }

      const promise = new Promise<
        Brpc.BrpcResult<z.infer<typeof value.output>>
      >((resolve) => {
        const timeout = setTimeout(() => {
          if (args.options?.onRequestTimeout) {
            try {
              args.options.onRequestTimeout();
            } catch (error) {
              console.warn("onRequestTimeout threw an error", error);
            }
          }

          resolve({
            ok: false,
            code: "REQUEST_TIMEOUT",
            request,
            response: null,
          });
        }, args.options?.timeoutMs ?? 10000);

        const { unsubscribe } = args.subscribe(async (message) => {
          if (message.senderAddress !== args.topic.peerAddress) {
            if (args.options?.onSelfSentMessage) {
              try {
                args.options.onSelfSentMessage({ message });
              } catch {
                console.warn("onSelfSentMessage threw an error");
              }
            }

            return;
          }

          if (
            message.conversation.context?.conversationId !==
            args.topic.context.conversationId
          ) {
            if (args.options?.onTopicMismatch) {
              try {
                args.options.onTopicMismatch({ message });
              } catch {
                console.warn("onTopicMismatch threw an error");
              }
            }

            return;
          }

          const json = jsonStringSchema.safeParse(message.content);

          if (!json.success) {
            if (args.options?.onReceivedInvalidJson) {
              try {
                args.options.onReceivedInvalidJson({ message });
              } catch (error) {
                console.warn("onReceivedInvalidJson threw an error", error);
              }
            }
            return;
          }

          const response = Brpc.brpcResponseSchema.safeParse(json.data);

          if (!response.success) {
            if (args.options?.onReceivedInvalidResponse) {
              try {
                args.options.onReceivedInvalidResponse({ message });
              } catch (error) {
                console.warn("onReceivedInvalidResponse threw an error", error);
              }
            }
            return;
          }

          const id = response.data.id;

          if (id !== request.id) {
            if (args.options?.onIdMismatch) {
              try {
                args.options.onIdMismatch({ message });
              } catch {
                console.warn("onNoSubscription threw an error");
              }
            }
            return;
          }

          unsubscribe();

          clearTimeout(timeout);

          const error = Brpc.brpcErrorSchema.safeParse(response.data.payload);

          if (error.success) {
            resolve({
              ok: false,
              code: error.data.code,
              request,
              response: response.data,
            });
          }

          const success = Brpc.brpcSuccessSchema.safeParse(
            response.data.payload,
          );

          if (success.success) {
            const output = value.output.safeParse(success.data.data);

            if (!output.success) {
              resolve({
                ok: false,
                code: "OUTPUT_TYPE_MISMATCH",
                request,
                response: response.data,
              });
            }

            resolve({
              ok: true,
              code: "SUCCESS",
              data: output.data,
              request,
              response: response.data,
            });
          }

          if (args.options?.onInvalidPayload) {
            try {
              args.options.onInvalidPayload({ message });
            } catch {
              console.warn("onInvalidPayload threw an error", error);
            }
          }

          resolve({
            ok: false,
            code: "INVALID_PAYLOAD",
            request,
            response: response.data,
          });
        });
      });

      try {
        const sendRequestArgs = {
          topic: args.topic,
          content: str,
        };

        if (args.options?.onSendingRequest) {
          try {
            args.options.onSendingRequest(sendRequestArgs);
          } catch {
            console.warn("onSendingRequest threw an error");
          }
        }

        const sent = await args.publish(sendRequestArgs);

        if (args.options?.onSentRequest) {
          try {
            args.options.onSentRequest({ message: sent.published });
          } catch {
            console.warn("onSentRequest threw an error");
          }
        }
      } catch (error) {
        if (args.options?.onSendRequestError) {
          try {
            args.options.onSendRequestError({ error: error as Error });
          } catch {
            console.warn("onSendRequestFailed threw an error");
          }
        }

        return {
          ok: false,
          code: "XMTP_SEND_FAILED",
          request,
          response: null,
        };
      }

      return promise;
    };
  }

  return client as Brpc.BrpcClient<typeof args.api>;
};
