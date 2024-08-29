import { Message } from "../types/Message.js";
import { QuiverContext } from "../types/QuiverContext.js";

export const createContext = (
  address: string,
  received: Message,
): QuiverContext => {
  return { address, received };
};
