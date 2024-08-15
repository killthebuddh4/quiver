import { z } from "zod";
import { Wallet } from "@ethersproject/wallet";
import { Client, Conversation as Xonversation } from "@xmtp/xmtp-js";
import { Conversation } from "./types/Conversation.js";
import { Message } from "./types/Message.js";
import { v4 as uuidv4 } from "uuid";
import { Publish } from "./types/Publish.js";
import { Subscribe } from "./types/Subscribe.js";
import { QuiverApi } from "./types/QuiverApi.js";
import { Start } from "./types/Start.js";
import { quiverRequestSchema } from "./lib/quiverRequestSchema.js";
import { quiverResponseSchema } from "./lib/quiverResponseSchema.js";
import { quiverErrorSchema } from "./lib/quiverErrorSchema.js";
import { quiverSuccessSchema } from "./lib/quiverSuccessSchema.js";
import { QuiverResponse } from "./types/QuiverResponse.js";
import { QuiverApiSpec } from "./types/QuiverApiSpec.js";
import { QuiverClient } from "./types/QuiverClient.js";
import { QuiverResult } from "./types/QuiverResult.js";

export const createQuiver = async (args: {
  options?: {
    wallet?: Wallet;
    env?: "dev" | "production";
    onAlreadyCreated?: () => void;
    onCreateWalletError?: (error: unknown) => void;
    onCreatingXmtp?: () => void;
    onCreatedXmtp?: () => void;
    onCreateXmtpError?: (error: unknown) => void;
    onStartingStream?: () => void;
    onStartedStream?: () => void;
    onStartStreamError?: (error: unknown) => void;
    onMessageReceived?: (message: Message) => void;
    onMissedMessage?: (message: Message) => void;
    onHandlerError?: (error: unknown) => void;
    onCreatingTopic?: (args: { topic: Conversation }) => void;
    onCreatedTopic?: (args: { topic: Conversation }) => void;
    onCreateTopicError?: (args: {
      topic: Conversation;
      error: unknown;
    }) => void;
    onSendingMessage?: (args: { topic: Conversation }) => void;
    onSentMessage?: (args: { message: Message }) => void;
    onSendError?: (args: { topic: Conversation }) => void;
    onReceivedInvalidJson?: () => void;
  };
}) => {
  let wallet: Wallet;
  try {
    if (args.options?.wallet !== undefined) {
      // Create a new Wallet as a validation.
      wallet = new Wallet(args.options.wallet.privateKey);
    } else {
      wallet = Wallet.createRandom();
    }
  } catch (error) {
    args.options?.onCreateWalletError?.(error);
    throw error;
  }

  let env: "dev" | "production";
  if (args.options?.env === undefined) {
    env = "dev";
  } else {
    env = args.options.env;
  }

  let xmtp: Client | null = null;
  let stream: AsyncGenerator<Message, void, unknown> | null = null;
  const handlers = new Map<string, (message: Message) => void>();

  const start: Start = async ({ options }) => {
    if (xmtp !== null) {
      throw new Error(`Quiver has already been started!`);
    }

    if (stream !== null) {
      throw new Error(`Stream has already been started!`);
    }

    const onCreatingXmtp =
      options?.onCreatingXmtp || args.options?.onCreatingXmtp;
    const onCreatedXmtp = options?.onCreatedXmtp || args.options?.onCreatedXmtp;
    const onCreateXmtpError =
      options?.onCreateXmtpError || args.options?.onCreateXmtpError;
    const onStartingStream =
      options?.onStartingStream || args.options?.onStartingStream;
    const onStartedStream =
      options?.onStartedStream || args.options?.onStartedStream;
    const onStartStreamError =
      options?.onStartStreamError || args.options?.onStartStreamError;

    onCreatingXmtp?.();

    try {
      xmtp = await Client.create(wallet, { env });
    } catch (error) {
      onCreateXmtpError?.(error);
      throw error;
    }

    onCreatedXmtp?.();

    onStartingStream?.();

    try {
      stream = await xmtp.conversations.streamAllMessages();
    } catch (error) {
      onStartStreamError?.(error);
      throw error;
    }

    onStartedStream?.();

    (async () => {
      for await (const message of stream) {
        try {
          args.options?.onMessageReceived?.(message);
        } catch {
          console.warn("args.options.onMessageReceived threw an error");
        }

        if (handlers.size === 0) {
          try {
            args.options?.onMissedMessage?.(message);
          } catch {
            console.warn("onNoHandlersForMessage threw an error");
          }
        }

        for (const handler of Array.from(handlers.values())) {
          try {
            handler(message);
          } catch (error) {
            try {
              args.options?.onHandlerError?.(error);
            } catch {
              console.warn("onHandlerError threw an error");
            }
          }
        }
      }
    })();
  };

  const subscribe: Subscribe = ({ handler }) => {
    const id = uuidv4();

    handlers.set(id, handler);

    return {
      unsubscribe: () => {
        handlers.delete(id);
      },
    };
  };

  const publish: Publish = async ({
    conversation: topic,
    content,
    options,
  }) => {
    if (xmtp === null) {
      throw new Error(
        "Quiver has not been started, or it has already been stopped",
      );
    }

    const onCreatingTopic =
      options?.onCreatingTopic || args.options?.onCreatingTopic;
    const onCreatedTopic =
      options?.onCreatedTopic || args.options?.onCreatedTopic;
    const onCreateTopicError =
      options?.onCreateTopicError || args.options?.onCreateTopicError;
    const onSendingMessage =
      options?.onSendingMessage || args.options?.onSendingMessage;
    const onSentMessage = options?.onSentMessage || args.options?.onSentMessage;
    const onSendError = options?.onSendError || args.options?.onSendError;

    onCreatingTopic?.({ topic });

    let conversation: Xonversation;
    try {
      conversation = await xmtp.conversations.newConversation(
        topic.peerAddress,
        topic.context,
      );
    } catch (error) {
      onCreateTopicError?.({ topic, error });
      throw error;
    }

    onCreatedTopic?.({ topic });

    onSendingMessage?.({ topic, content });

    let sent: Message;
    try {
      sent = await conversation.send(content);
    } catch (error) {
      onSendError?.({ topic, error });
      throw error;
    }

    onSentMessage?.({ message: sent });

    return { published: sent };
  };

  const stop = async () => {
    if (xmtp === null) {
      return;
    }

    xmtp = null;

    if (stream === null) {
      return;
    }

    await stream.return();

    stream = null;
  };

  const client = <Api extends QuiverApiSpec>(
    api: Api,
    router: {
      address: string;
      namespace?: string;
    },
    options?: {
      timeoutMs?: number;
      onRequestTimeout?: () => void;
      onSelfSentMessage?: (args: { message: Message }) => void;
      onUnknownSender?: (args: { message: Message }) => void;
      onTopicMismatch?: (args: { message: Message }) => void;
      onReceivedInvalidJson?: (args: { message: Message }) => void;
      onReceivedInvalidResponse?: (args: { message: Message }) => void;
      onOutputTypeMismatch?: (args: { message: Message }) => void;
      onInvalidPayload?: (args: { message: Message }) => void;
      onIdMismatch?: (args: { message: Message }) => void;
      onResponseHandlerError?: (args: { error: unknown }) => void;
      onInputSerializationError?: () => void;
      onSendingRequest?: (args: {
        topic: Conversation;
        content: string;
      }) => void;
      onSentRequest?: (args: { message: Message }) => void;
      onSendRequestError?: (args: { error: unknown }) => void;
    },
  ) => {
    const namespace = router.namespace ?? "quiver/0.0.1";

    const client = {};

    for (const [key, value] of Object.entries(api)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any)[key as keyof typeof api] = async (
        input: z.infer<typeof value.input>,
      ) => {
        const request = {
          id: uuidv4(),
          function: key,
          arguments: input,
        };

        let str: string;
        try {
          str = JSON.stringify(request);
        } catch {
          options?.onInputSerializationError?.();

          return {
            ok: false,
            code: "INPUT_SERIALIZATION_FAILED",
            response: null,
          };
        }

        const promise = new Promise<
          // TODO This type should be something that wraps these types
          // and includes the request and response (and maybe more).
          QuiverResult<z.infer<typeof value.output>>
        >((resolve) => {
          const timeout = setTimeout(() => {
            options?.onRequestTimeout?.();

            resolve({
              ok: false,
              status: "REQUEST_TIMEOUT",
            });
          }, options?.timeoutMs ?? 10000);

          /* TODO, when do we throw and when do we not throw????? */
          const { unsubscribe } = subscribe({
            handler: (message) => {
              if (message.senderAddress === wallet.address) {
                options?.onSelfSentMessage?.({ message });
                return;
              }

              if (message.senderAddress !== router.address) {
                options?.onUnknownSender?.({ message });
                return;
              }

              if (message.conversation.context?.conversationId !== namespace) {
                options?.onTopicMismatch?.({ message });
                return;
              }

              let json;
              try {
                json = JSON.parse(String(message.content));
              } catch (error) {
                options?.onReceivedInvalidJson?.({ message });
                return;
              }

              let response;
              try {
                response = quiverResponseSchema.parse(json);
              } catch (error) {
                options?.onReceivedInvalidResponse?.({ message });
                return;
              }

              const id = response.id;

              if (id !== request.id) {
                options?.onIdMismatch?.({ message });
                return;
              }

              unsubscribe();

              clearTimeout(timeout);

              const error = quiverErrorSchema.safeParse(response.data);

              if (error.success) {
                resolve({
                  ok: false,
                  status: error.data.status,
                });
              }

              const success = quiverSuccessSchema.safeParse(response.data);

              if (!success.success) {
                resolve({
                  ok: false,
                  status: "INVALID_RESPONSE",
                  request: JSON.stringify(request, null, 2),
                  response: JSON.stringify(response.data, null, 2),
                });
              }

              const output = value.output.safeParse(success.data?.data);

              if (!output.success) {
                resolve({
                  ok: false,
                  status: "OUTPUT_TYPE_MISMATCH",
                });
              }

              resolve({
                ok: true,
                status: "SUCCESS",
                data: output.data,
              });
            },
          });
        });

        try {
          options?.onSendingRequest?.({
            topic: {
              peerAddress: router.address,
              context: {
                conversationId: namespace,
                metadata: {},
              },
            },
            content: str,
          });

          const sent = await publish({
            conversation: {
              peerAddress: router.address,
              context: {
                conversationId: namespace,
                metadata: {},
              },
            },
            content: str,
          });

          options?.onSentRequest?.({ message: sent.published });
        } catch (error) {
          options?.onSendRequestError?.({ error });

          return {
            ok: false,
            code: "XMTP_SEND_FAILED",
            response: null,
          };
        }

        return promise;
      };
    }

    return client as QuiverClient<typeof api>;
  };

  const router = (
    api: QuiverApi,
    options?: {
      namespace?: string;
      onReceivedMessage?: (args: { message: Message }) => void;
      onSelfSentMessage?: (args: { message: Message }) => void;
      onTopicMismatch?: (args: { message: Message }) => void;
      onReceivedInvalidJson?: (args: { message: Message }) => void;
      onReceivedInvalidRequest?: (args: { message: Message }) => void;
      onUnknownFunction?: () => void;
      onAuthError?: (args: { error: unknown }) => void;
      onUnauthorized?: () => void;
      onInputTypeMismatch?: () => void;
      onHandlingInput?: (args: { input: unknown }) => void;
      onHandlerError?: (args: { error: unknown }) => void;
      onOutputSerializationError?: () => void;
      onSendingResponse?: () => void;
      onSentResponse?: ({ sent }: { sent: Message }) => void;
      onSendResponseError?: () => void;
    },
  ) => {
    const namespace = options?.namespace ?? "quiver/0.0.1";

    return subscribe({
      handler: async (message) => {
        if (message.senderAddress === wallet.address) {
          options?.onSelfSentMessage?.({ message });
          return;
        }

        if (message.conversation.context?.conversationId !== namespace) {
          options?.onTopicMismatch?.({ message });
          return;
        }

        options?.onReceivedMessage?.({ message });

        let json;
        try {
          json = JSON.parse(String(message.content));
        } catch (error) {
          options?.onReceivedInvalidJson?.({ message });
          return;
        }

        let request;
        try {
          request = quiverRequestSchema.parse(json);
        } catch (error) {
          options?.onReceivedInvalidRequest?.({ message });
          return;
        }

        const respond = async (response: QuiverResponse) => {
          options?.onSendingResponse?.();

          let content;
          try {
            content = JSON.stringify(response);
          } catch (error) {
            options?.onOutputSerializationError?.();
            return;
          }

          try {
            const sent = await publish({
              conversation: {
                peerAddress: message.senderAddress,
                context: {
                  conversationId: namespace,
                  metadata: {},
                },
              },
              content,
            });

            options?.onSentResponse?.({ sent: sent.published });
          } catch (error) {
            options?.onSendResponseError?.();
          }
        };

        const func = api[request.function];

        if (func === undefined) {
          options?.onUnknownFunction?.();

          respond({
            id: request.id,
            data: {
              ok: false,
              status: "UNKNOWN_FUNCTION",
            },
          });

          return;
        }

        let isAuthorized = false;

        const context = {
          id: request.id,
          message,
        };

        try {
          isAuthorized = await func.auth({ context });
        } catch (error) {
          options?.onAuthError?.({ error });
          isAuthorized = false;
        }

        if (!isAuthorized) {
          options?.onUnauthorized?.();

          respond({
            id: request.id,
            data: {
              ok: false,
              status: "UNAUTHORIZED",
            },
          });

          return;
        }

        let input;
        try {
          input = func.input.parse(json.arguments);
        } catch (error) {
          options?.onInputTypeMismatch?.();

          respond({
            id: request.id,
            data: {
              ok: false,
              status: "INPUT_TYPE_MISMATCH",
            },
          });

          return;
        }

        options?.onHandlingInput?.({ input });

        let output;
        try {
          output = await func.handler(input, context);
        } catch (error) {
          options?.onHandlerError?.({ error });

          respond({
            id: request.id,
            data: {
              ok: false,
              status: "SERVER_ERROR",
            },
          });

          return;
        }

        respond({
          id: request.id,
          data: {
            ok: true,
            status: "SUCCESS",
            data: output,
          },
        });
      },
    });
  };

  return {
    address: wallet.address,
    client,
    router,
    start,
    stop,
    subscribe,
    publish,
  };
};
