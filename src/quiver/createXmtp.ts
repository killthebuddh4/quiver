import { Wallet } from "@ethersproject/wallet";
import { Client } from "@xmtp/xmtp-js";
import { Message } from "../types/Message.js";
import { Conversation } from "../types/Conversation.js";
import { Signer } from "../types/xmtp/Signer.js";
import { getUniqueId } from "../lib/getUniqueId.js";
import { QuiverXmtpOptions } from "../types/QuiverXmtpOptions.js";
import { QuiverXmtp } from "../types/QuiverXmtp.js";

export const createXmtp = (options?: QuiverXmtpOptions): QuiverXmtp => {
  const state = {
    signer: (() => {
      if (options?.init?.signer !== undefined) {
        return options.init.signer;
      } else if (options?.init?.key !== undefined) {
        return new Wallet(options.init.key);
      } else {
        return Wallet.createRandom();
      }
    })(),
    xmtp: undefined,
    stream: undefined,
    handlers: new Map<string, (message: Message) => Promise<void> | void>(),
  } as {
    signer: Signer;
    xmtp: Client | undefined;
    stream: AsyncGenerator<Message, void, unknown> | undefined;
    handlers: Map<string, (message: Message) => Promise<void> | void>;
  };

  const handlers = new Map<
    string,
    (message: Message) => Promise<void> | void
  >();

  const start = async (): Promise<QuiverXmtp> => {
    if (state.stream !== undefined) {
      return {
        signer: state.signer,
        address: state.signer.address,
        start,
        stop,
        subscribe,
        publish,
      };
    }

    try {
      state.xmtp = await Client.create(state.signer);
    } catch (err) {
      options?.logs?.start?.onStartXmtpError?.(err);

      throw err;
    }

    try {
      state.stream = await state.xmtp.conversations.streamAllMessages();
    } catch (err) {
      options?.logs?.start?.onStartStreamError?.(err);

      throw err;
    }

    (async () => {
      if (state.stream === undefined) {
        throw new Error(
          `Stream not yet initialized, this should be impossible`,
        );
      }

      for await (const message of state.stream) {
        if (message.senderAddress === state.signer.address) {
          options?.logs?.handle?.onSelfSentMessage?.(message);

          continue;
        }

        options?.logs?.handle?.onMessage?.(message);

        for (const handler of Array.from(handlers.values())) {
          try {
            options?.logs?.handle?.onHandling?.(message);

            await handler(message);
          } catch (err) {
            options?.logs?.handle?.onHandlerError?.(err);

            if (options?.throwOnHandlerError) {
              throw err;
            }

            continue;
          }
        }
      }
    })();

    return {
      signer: state.signer,
      address: state.signer.address,
      start,
      stop,
      subscribe,
      publish,
    };
  };

  const stop = () => {
    if (state.stream === undefined) {
      throw new Error(`Stream not yet initialized`);
    }

    state.stream.return();
  };

  const subscribe = async (handler: (message: Message) => void) => {
    options?.logs?.pubsub?.onSubscribe?.();

    const id = getUniqueId();

    handlers.set(id, handler);

    return {
      unsubscribe: () => {
        options?.logs?.pubsub?.onUnsubscribe?.();
        handlers.delete(id);
        if (handlers.size === 0) {
          stop();
        }
      },
    };
  };

  const publish = async (args: {
    conversation: Conversation;
    content: string;
  }) => {
    options?.logs?.pubsub?.onPublishing?.(args.conversation, args.content);

    if (state.xmtp === undefined) {
      throw new Error(`XMTP client not yet initialized`);
    }

    let conversation;
    try {
      conversation = await state.xmtp.conversations.newConversation(
        args.conversation.peerAddress,
        args.conversation.context,
      );
    } catch (err) {
      options?.logs?.pubsub?.onCreateConversationError?.(
        args.conversation,
        err,
      );

      throw err;
    }

    try {
      const sent = await conversation.send(args.content);

      options?.logs?.pubsub?.onSentMessage?.(sent);

      return sent;
    } catch (err) {
      options?.logs?.pubsub?.onSendMessageError?.(args.content, err);

      throw err;
    }
  };

  return {
    signer: state.signer,
    address: state.signer.address,
    start,
    stop,
    subscribe,
    publish,
  };
};
