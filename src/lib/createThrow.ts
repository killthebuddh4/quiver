import { Message } from "../types/Message.js";
import { Fig } from "../types/Fig.js";
import { QuiverError } from "../types/QuiverError.js";
import { QuiverThrow } from "../types/QuiverThrow.js";

export const createThrow = (
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

    await publish({
      conversation: message.conversation,
      content,
    });
  };
};
