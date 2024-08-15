import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { quiverResponseSchema } from "./lib/quiverResponseSchema.js";
import { quiverErrorSchema } from "./lib/quiverErrorSchema.js";
import { quiverSuccessSchema } from "./lib/quiverSuccessSchema.js";
import { Topic } from "./types/Topic.js";
import { Message } from "./types/Message.js";
import { Quiver } from "./types/Quiver.js";
import { QuiverApiSpec } from "./types/QuiverApiSpec.js";
import { QuiverError } from "./types/QuiverError.js";
import { QuiverSuccess } from "./types/QuiverSuccess.js";
import { QuiverClient } from "./types/QuiverClient.js";

export const createClient = <Api extends QuiverApiSpec>(args: {
  api: Api;
  router: {
    address: string;
    topic: Topic;
  };
  quiver: Quiver;
  options?: {
    timeoutMs?: number;
    onRequestTimeout?: () => void;
    onSelfSentMessage?: (args: { message: Message }) => void;
    onUnknownSender?: (args: { message: Message }) => void;
    onTopicMismatch?: (args: { message: Message }) => void;
    onReceivedInvalidJson?: (args: { message: Message }) => void;
    onReceivedInvalidResponse?: (args: { message: Message }) => void;
    onOutputTypeMismatch?: (args: { message: Message }) => void;
    onInvalidPayload: (args: { message: Message }) => void;
    onIdMismatch?: (args: { message: Message }) => void;
    onResponseHandlerError?: (args: { error: unknown }) => void;
    onInputSerializationError?: () => void;
    onSendingRequest?: (args: { topic: Topic; content: string }) => void;
    onSentRequest?: (args: { message: Message }) => void;
    onSendRequestError?: (args: { error: unknown }) => void;
  };
}) => {
  const client = {};

  for (const [key, value] of Object.entries(args.api)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (client as any)[key as keyof typeof args.api] = async (
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
        args.options?.onInputSerializationError?.();

        return {
          ok: false,
          code: "INPUT_SERIALIZATION_FAILED",
          request,
          response: null,
        };
      }

      const promise = new Promise<
        QuiverError | QuiverSuccess<z.infer<typeof value.output>>
      >((resolve) => {
        const timeout = setTimeout(() => {
          args.options?.onRequestTimeout?.();

          resolve({
            ok: false,
            status: "REQUEST_TIMEOUT",
            request,
          });
        }, args.options?.timeoutMs ?? 10000);

        /* TODO, when do we throw and when do we not throw????? */
        const { unsubscribe } = args.quiver.subscribe({
          handler: (message) => {
            if (message.senderAddress === args.quiver.address) {
              args.options?.onSelfSentMessage?.({ message });
              return;
            }

            if (message.senderAddress !== args.router.address) {
              args.options?.onUnknownSender?.({ message });
              return;
            }

            if (
              message.conversation.context?.conversationId !==
              args.router.topic.context.conversationId
            ) {
              args.options?.onTopicMismatch?.({ message });
              return;
            }

            let json;
            try {
              json = JSON.parse(String(message.content));
            } catch (error) {
              args.options?.onReceivedInvalidJson?.({ message });
              return;
            }

            const response = quiverResponseSchema.safeParse(json);

            if (!response.success) {
              args?.options?.onReceivedInvalidResponse?.({ message });
              return;
            }

            const id = response.data.id;

            if (id !== request.id) {
              args.options?.onIdMismatch?.({ message });
              return;
            }

            unsubscribe();

            clearTimeout(timeout);

            const error = quiverErrorSchema.safeParse(response.data.data);

            if (error.success) {
              resolve({
                ok: false,
                status: error.data.status,
                request,
              });
            }

            const success = quiverSuccessSchema.safeParse(response.data.data);

            if (!success.success) {
              resolve({
                ok: false,
                status: "INVALID_RESPONSE",
                request,
              });
            }

            const output = value.output.safeParse(success.data?.data);

            if (!output.success) {
              resolve({
                ok: false,
                status: "OUTPUT_TYPE_MISMATCH",
                request,
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
        args.options?.onSendingRequest?.({
          topic: args.router.topic,
          content: str,
        });

        const sent = await args.quiver.publish({
          topic: args.router.topic,
          content: str,
        });

        args.options?.onSentRequest?.({ message: sent.published });
      } catch (error) {
        args.options?.onSendRequestError?.({ error });

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

  return client as QuiverClient<typeof args.api>;
};
