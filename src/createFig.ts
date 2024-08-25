import { Wallet } from "@ethersproject/wallet";
import { Client } from "@xmtp/xmtp-js";
import { Message } from "./types/Message.js";
import { Conversation } from "./types/Conversation.js";
import { Fig } from "./types/Fig.js";
import { v4 as uuid } from "uuid";
import { Signer } from "./types/Signer.js";

export const createFig = async (options?: {
  signer?: Signer;
}): Promise<Fig> => {
  const signer = options?.signer ?? Wallet.createRandom();
  const xmtp = await Client.create(signer);
  const stream = await xmtp.conversations.streamAllMessages();
  const handlers = new Map<string, (message: Message) => void>();

  (async () => {
    for await (const message of stream) {
      if (message.senderAddress === signer.address) {
        continue;
      }

      for (const handler of Array.from(handlers.values())) {
        console.log(
          `Fig ${signer.address} handling message: ${message.content} from ${message.senderAddress}`,
        );
        handler(message);
      }
    }
  })();

  const start = async () => {
    return () => null;
  };

  const stop = () => {
    stream.return(null);
  };

  const subscribe = async (handler: (message: Message) => void) => {
    const id = uuid();
    handlers.set(id, handler);
    return {
      unsubscribe: () => {
        handlers.delete(id);
      },
    };
  };

  const publish = async (args: {
    conversation: Conversation;
    content: string;
  }) => {
    console.log(
      `Fig ${signer.address} publishing message: ${args.content} to ${args.conversation.peerAddress}`,
    );

    const c = await xmtp.conversations.newConversation(
      args.conversation.peerAddress,
      args.conversation.context,
    );

    return c.send(args.content);
  };

  return {
    address: signer.address,
    start,
    stop,
    publish,
    subscribe,
  };
};
