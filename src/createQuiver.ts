import { Wallet } from "@ethersproject/wallet";
import { Client, Conversation } from "@xmtp/xmtp-js";
import { Message } from "./types/Message.js";
import { v4 as uuidv4 } from "uuid";
import { Publish } from "./types/Publish.js";
import { Subscribe } from "./types/Subscribe.js";
import { Topic } from "./types/Topic.js";
import { Start } from "./types/Start.js";

export const createQuiver = async (args: {
  options?: {
    wallet?: Wallet;
    env?: "dev" | "production";
    onAlreadyCreated?: () => void;
    onCreateWalletError?: (error: unknown) => void;
    onCreatingXmtp?: () => void;
    onCreatedXmtp?: () => void;
    onCreateXmtpError?: (error: unknown) => void;
    onStartingStream?: () => void;
    onStartedStream?: () => void;
    onStartStreamError?: (error: unknown) => void;
    onMessageReceived?: (message: Message) => void;
    onMissedMessage?: (message: Message) => void;
    onHandlerError?: (error: unknown) => void;
    onCreatingTopic?: (args: { topic: Topic }) => void;
    onCreatedTopic?: (args: { topic: Topic }) => void;
    onCreateTopicError?: (args: { topic: Topic; error: unknown }) => void;
    onSendingMessage?: (args: { topic: Topic }) => void;
    onSentMessage?: (args: { message: Message }) => void;
    onSendError?: (args: { topic: Topic }) => void;
    onReceivedInvalidJson?: () => void;
  };
}) => {
  let wallet: Wallet;
  try {
    if (args.options?.wallet) {
      // Create a new Wallet as a validation.
      wallet = new Wallet(args.options.wallet.privateKey);
    }

    wallet = Wallet.createRandom();
  } catch (error) {
    args.options?.onCreateWalletError?.(error);
    throw error;
  }

  let env: "dev" | "production";
  if (args.options?.env === undefined) {
    env = "dev";
  } else {
    env = args.options.env;
  }

  let xmtp: Client | null;
  let stream: AsyncGenerator<Message, void, unknown> | null;
  const handlers = new Map<string, (message: Message) => void>();

  const start: Start = async ({ options }) => {
    if (xmtp !== null) {
      throw new Error(`Quiver has already been started!`);
    }

    if (stream !== null) {
      throw new Error(`Stream has already been started!`);
    }

    const onCreatingXmtp =
      options?.onCreatingXmtp || args.options?.onCreatingXmtp;
    const onCreatedXmtp = options?.onCreatedXmtp || args.options?.onCreatedXmtp;
    const onCreateXmtpError =
      options?.onCreateXmtpError || args.options?.onCreateXmtpError;
    const onStartingStream =
      options?.onStartingStream || args.options?.onStartingStream;
    const onStartedStream =
      options?.onStartedStream || args.options?.onStartedStream;
    const onStartStreamError =
      options?.onStartStreamError || args.options?.onStartStreamError;

    onCreatingXmtp?.();

    try {
      xmtp = await Client.create(wallet, { env });
    } catch (error) {
      onCreateXmtpError?.(error);
      throw error;
    }

    onCreatedXmtp?.();

    onStartingStream?.();

    try {
      stream = await xmtp.conversations.streamAllMessages();
    } catch (error) {
      onStartStreamError?.(error);
      throw error;
    }

    onStartedStream?.();

    (async () => {
      for await (const message of stream) {
        try {
          args.options?.onMessageReceived?.(message);
        } catch {
          console.warn("args.options.onMessageReceived threw an error");
        }

        if (handlers.size === 0) {
          try {
            args.options?.onMissedMessage?.(message);
          } catch {
            console.warn("onNoHandlersForMessage threw an error");
          }
        }

        for (const handler of Array.from(handlers.values())) {
          try {
            handler(message);
          } catch (error) {
            try {
              args.options?.onHandlerError?.(error);
            } catch {
              console.warn("onHandlerError threw an error");
            }
          }
        }
      }
    })();
  };

  const subscribe: Subscribe = ({ handler }) => {
    if (stream === null) {
      throw new Error("Stream has already been stopped");
    }

    const id = uuidv4();

    handlers.set(id, handler);

    return {
      unsubscribe: () => {
        handlers.delete(id);
      },
    };
  };

  const publish: Publish = async ({ topic, content, options }) => {
    if (xmtp === null) {
      throw new Error(
        "Quiver has not been started, or it has already been stopped",
      );
    }

    const onCreatingTopic =
      options?.onCreatingTopic || args.options?.onCreatingTopic;
    const onCreatedTopic =
      options?.onCreatedTopic || args.options?.onCreatedTopic;
    const onCreateTopicError =
      options?.onCreateTopicError || args.options?.onCreateTopicError;
    const onSendingMessage =
      options?.onSendingMessage || args.options?.onSendingMessage;
    const onSentMessage = options?.onSentMessage || args.options?.onSentMessage;
    const onSendError = options?.onSendError || args.options?.onSendError;

    onCreatingTopic?.({ topic });

    let conversation: Conversation;
    try {
      conversation = await xmtp.conversations.newConversation(
        topic.peerAddress,
        topic.context,
      );
    } catch (error) {
      onCreateTopicError?.({ topic, error });
      throw error;
    }

    onCreatedTopic?.({ topic });

    onSendingMessage?.({ topic, content });

    let sent: Message;
    try {
      sent = await conversation.send(content);
    } catch (error) {
      onSendError?.({ topic, error });
      throw error;
    }

    onSentMessage?.({ message: sent });

    return { published: sent };
  };

  const stop = async () => {
    if (xmtp === null) {
      return;
    }

    xmtp = null;

    if (stream === null) {
      return;
    }

    await stream.return();

    stream = null;
  };

  return {
    address: wallet.address,
    start,
    stop,
    subscribe,
    publish,
  };
};
