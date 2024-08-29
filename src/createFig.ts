import { Wallet } from "@ethersproject/wallet";
import { Client } from "@xmtp/xmtp-js";
import { Message } from "./types/Message.js";
import { Conversation } from "./types/Conversation.js";
import { Fig } from "./types/Fig.js";
import { Signer } from "./types/Signer.js";
import { getUniqueId } from "./quiver/getUniqueId.js";

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
    const id = getUniqueId();

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
    const conversation = await xmtp.conversations.newConversation(
      args.conversation.peerAddress,
      args.conversation.context,
    );

    return conversation.send(args.content);
  };

  return {
    address: signer.address,
    start,
    stop,
    publish,
    subscribe,
  };
};
