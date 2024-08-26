import { Message } from "../types/Message.js";
import { QuiverReturn } from "../types/QuiverReturn.js";
import { QuiverSuccess } from "../types/QuiverSuccess.js";
import { Fig } from "../types/Fig.js";
import { parsePath } from "./parsePath.js";

export const createReturn = (
  address: string,
  message: Message,
  publish: Fig["publish"],
): QuiverReturn => {
  return async (res) => {
    const ret: QuiverSuccess<unknown> = {
      id: message.id,
      ok: true,
      ...res,
    };

    let content;
    try {
      content = JSON.stringify(ret);
    } catch {
      // TODO!
      throw new Error(
        `Failed to serialize return response for message ${message.id}`,
      );
    }

    const path = parsePath(message.conversation.context?.conversationId);

    if (!path.ok) {
      // TODO!
      throw new Error(
        `Failed to parse path from message ${message.id}: ${path.reason}`,
      );
    }

    const conversationId = `${path.value.quiver}/${path.value.version}/router/${address}/${path.value.namespace}/${path.value.function}`;

    await publish({
      conversation: {
        peerAddress: message.conversation.peerAddress,
        context: {
          conversationId,
          metadata: {},
        },
      },
      content,
    });
  };
};
