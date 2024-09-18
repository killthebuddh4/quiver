import { Wallet } from "@ethersproject/wallet";
import { Client } from "@xmtp/xmtp-js";
import { Message } from "../types/Message.js";
import { Conversation } from "../types/Conversation.js";
import { Signer } from "../types/util/Signer.js";
import { getUniqueId } from "../lib/getUniqueId.js";
import * as Quiver from "../types/quiver/quiver.js";
import { QuiverProviderOptions } from "../types/options/QuiverProviderOptions.js";

export class QuiverProvider implements Quiver.Provider {
  public signer: Signer;
  private xmtp?: Client;
  private stream?: AsyncGenerator<Message, void, unknown>;
  private handlers = new Map<
    string,
    (message: Message) => Promise<void> | void
  >();
  private options?: QuiverProviderOptions;

  public constructor(options?: QuiverProviderOptions) {
    this.options = options;

    if (options?.init?.signer !== undefined) {
      this.signer = options.init.signer;
    } else if (options?.init?.key !== undefined) {
      this.signer = new Wallet(options.init.key);
    } else {
      this.signer = Wallet.createRandom();
    }
  }

  public async start() {
    if (this.stream !== undefined) {
      return this;
    }

    try {
      this.xmtp = await Client.create(this.signer);
    } catch (err) {
      this.options?.logs?.start?.onStartXmtpError?.(err);

      throw err;
    }

    try {
      this.stream = await this.xmtp.conversations.streamAllMessages();
    } catch (err) {
      this.options?.logs?.start?.onStartStreamError?.(err);

      throw err;
    }

    const stream = this.stream;

    (async () => {
      for await (const message of stream) {
        if (message.senderAddress === this.signer.address) {
          this.options?.logs?.handle?.onSelfSentMessage?.(message);

          continue;
        }

        this.options?.logs?.handle?.onMessage?.(message);

        for (const handler of Array.from(this.handlers.values())) {
          try {
            this.options?.logs?.handle?.onHandling?.(message);

            await handler(message);
          } catch (err) {
            this.options?.logs?.handle?.onHandlerError?.(err);

            if (this.options?.throwOnHandlerError) {
              throw err;
            }

            continue;
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
    this.options?.logs?.pubsub?.onSubscribe?.();

    const id = getUniqueId();

    this.handlers.set(id, handler);

    return {
      unsubscribe: () => {
        this.options?.logs?.pubsub?.onUnsubscribe?.();
        this.handlers.delete(id);
        if (this.handlers.size === 0) {
          this.stop();
        }
      },
    };
  }

  public async publish(args: { conversation: Conversation; content: string }) {
    this.options?.logs?.pubsub?.onPublishing?.(args.conversation, args.content);

    if (this.xmtp === undefined) {
      throw new Error(`XMTP client not yet initialized`);
    }

    let conversation;
    try {
      conversation = await this.xmtp.conversations.newConversation(
        args.conversation.peerAddress,
        args.conversation.context,
      );
    } catch (err) {
      this.options?.logs?.pubsub?.onCreateConversationError?.(
        args.conversation,
        err,
      );

      throw err;
    }

    try {
      const sent = await conversation.send(args.content);

      this.options?.logs?.pubsub?.onSentMessage?.(sent);

      return sent;
    } catch (err) {
      this.options?.logs?.pubsub?.onSendMessageError?.(args.content, err);

      throw err;
    }
  }
}
