import { Message } from "../types/Message.js";

export const createHandler = () => {
  return (message: Message) => {
    return message;
  };
};
