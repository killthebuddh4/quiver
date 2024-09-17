import { Wallet } from "@ethersproject/wallet";
import { Client } from "@xmtp/xmtp-js";
import { Message } from "../types/Message.js";
import { Conversation } from "../types/Conversation.js";
import { Signer } from "../types/util/Signer.js";
import { getUniqueId } from "../lib/getUniqueId.js";
import * as Quiver from "../types/quiver/quiver.js";

export class QuiverProvider implements Quiver.Provider {
  public signer: Signer;
  private xmtp?: Client;
  private stream?: AsyncGenerator<Message, void, unknown>;
  private handlers = new Map<string, (message: Message) => void>();

  public constructor(options?: { signer?: Signer }) {
    this.signer = options?.signer ?? Wallet.createRandom();
  }

  public async start() {
    this.xmtp = await Client.create(this.signer);
    this.stream = await this.xmtp.conversations.streamAllMessages();

    const stream = this.stream;

    (async () => {
      for await (const message of stream) {
        if (message.senderAddress === this.signer.address) {
          continue;
        }

        console.log(
          `PROVIDER @${this.signer.address} RECEIVED MESSAGE FROM @${message.senderAddress}`,
        );

        for (const handler of Array.from(this.handlers.values())) {
          try {
            console.log(`PROVIDER @${this.signer.address} CALLING HANDLER`);
            await handler(message);
          } catch (e) {
            console.log(`PROVIDER @${this.signer.address} HANDLER ERROR`);
            console.error(e);
          }
        }
      }
    })();

    return this;
  }

  public stop() {
    if (this.stream === undefined) {
      throw new Error(`Stream not yet initialized`);
    }

    this.stream.return();
  }

  public async subscribe(handler: (message: Message) => void) {
    console.log(`PROIVDER @${this.signer.address} SUBSCRIBE CALLED`);

    const id = getUniqueId();

    this.handlers.set(id, handler);

    console.log(`HANDLER ADDED TO PROVIDER @${this.signer.address}`);

    return {
      unsubscribe: () => {
        this.handlers.delete(id);
      },
    };
  }

  public async publish(args: { conversation: Conversation; content: string }) {
    if (this.xmtp === undefined) {
      throw new Error(`XMTP client not yet initialized`);
    }

    const conversation = await this.xmtp.conversations.newConversation(
      args.conversation.peerAddress,
      args.conversation.context,
    );

    return conversation.send(args.content);
  }
}
