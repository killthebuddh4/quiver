import { Message } from "../types/Message.js";
import { Fig } from "../types/Fig.js";
import { QuiverError } from "../types/QuiverError.js";
import { QuiverThrow } from "../types/QuiverThrow.js";
import { parseQuiverPath } from "./parseQuiverPath.js";

export const createThrow = (
  address: string,
  message: Message,
  publish: Fig["publish"],
): QuiverThrow => {
  return async (res) => {
    const err: QuiverError = {
      id: message.id,
      ok: false,
      ...res,
    };

    let content;
    try {
      content = JSON.stringify(err);
    } catch {
      // TODO, how should we handle this?
      throw new Error("SHOULD DO SOMETHING HERE");
    }

    const path = parseQuiverPath(message.conversation.context?.conversationId);

    if (!path.ok) {
      // TODO, how should we handle this?
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
