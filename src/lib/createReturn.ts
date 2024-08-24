import { Message } from "../types/Message.js";
import { QuiverReturn } from "../types/QuiverReturn.js";
import { QuiverSuccess } from "../types/QuiverSuccess.js";
import { Fig } from "../types/Fig.js";

export const createReturn = (
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

    await publish({
      conversation: message.conversation,
      content,
    });
  };
};
