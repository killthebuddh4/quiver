import { Wallet } from "@ethersproject/wallet";
import { Client, Conversation } from "@xmtp/xmtp-js";
import { Message } from "./types/Message.js";
import { v4 as uuidv4 } from "uuid";
import { PublishOptions } from "./types/PublishOptions.js";
import { Publish } from "./types/Publish.js";
import { StartPubSub } from "./types/StartPubSub.js";
import { StartPubSubOptions } from "./types/StartPubSubOptions.js";
import { HandlerOptions } from "./types/HandlerOptions.js";
import { Subscribe } from "./types/Subscribe.js";
import { createClient } from "./createClient.js";
import { createRouter } from "./createRouter.js";
import { ClientOptions } from "./types/ClientOptions.js";
import { Topic } from "./types/Topic.js";
import * as Brpc from "./types/brpc.js";
import { RouterOptions } from "./types/RouterOptions.js";

export const createBrpc = (args: {
  options?: HandlerOptions & StartPubSubOptions & PublishOptions;
}) => {
  const wallet = (() => {
    if (args.options?.wallet) {
      return args.options.wallet;
    }

    return Wallet.createRandom();
  })();

  let xmtp: Client | null = null;
  let stream: AsyncGenerator<Message, void, unknown> | null = null;
  const handlers = new Map<string, (message: Message) => void>();

  const start: StartPubSub = async ({ options }) => {
    if (handlers.size === 0) {
      try {
        if (options?.onStartWithoutHandlers) {
          options.onStartWithoutHandlers();
        } else {
          if (args.options?.onStartWithoutHandlers) {
            args.options.onStartWithoutHandlers();
          }
        }
      } catch {
        console.warn("onStartWithoutHandlers threw an error");
      }
    }

    try {
      if (options?.onCreatingXmtp) {
        options.onCreatingXmtp();
      } else {
        if (args.options?.onCreatingXmtp) {
          args.options.onCreatingXmtp();
        }
      }
    } catch {
      console.warn("onCreatingXmtp threw an error");
    }

    try {
      const env = (() => {
        if (options?.env !== undefined) {
          return options.env;
        }

        return "dev";
      })();

      xmtp = await Client.create(wallet, { env });
    } catch (error) {
      try {
        if (options?.onCreateXmtpError) {
          options.onCreateXmtpError(error as Error);
        } else {
          if (args.options?.onCreateXmtpError) {
            args.options.onCreateXmtpError(error as Error);
          }
        }
      } catch {
        console.warn("onCreateXmtpError threw an error");
      }

      throw error;
    }

    try {
      if (options?.onCreatedXmtp) {
        options.onCreatedXmtp();
      } else {
        if (args.options?.onCreatedXmtp) {
          args.options.onCreatedXmtp();
        }
      }
    } catch {
      console.warn("onCreatedXmtp threw an error");
    }

    try {
      if (options?.onStartingStream) {
        options.onStartingStream();
      } else {
        if (args.options?.onStartingStream) {
          args.options.onStartingStream();
        }
      }
    } catch {
      console.warn("onStartingStream threw an error");
    }

    try {
      stream = await xmtp.conversations.streamAllMessages();
    } catch (error) {
      try {
        if (options?.onStartStreamError) {
          options.onStartStreamError(error as Error);
        } else {
          if (args.options?.onStartStreamError) {
            args.options.onStartStreamError(error as Error);
          }
        }
      } catch {
        console.warn("onStartStreamError threw an error");
      }

      throw error;
    }

    try {
      if (options?.onStartedStream) {
        options.onStartedStream();
      } else {
        if (args.options?.onStartedStream) {
          args.options.onStartedStream();
        }
      }
    } catch {
      console.warn("onStartedStream threw an error");
    }

    (async () => {
      for await (const message of stream) {
        if (message.senderAddress === xmtp.address) {
          try {
            if (args.options?.onSelfSentMessage) {
              args.options.onSelfSentMessage({ message });
            }
          } catch {
            console.warn("onSelfSentMessage threw an error");
          }

          continue;
        }

        if (handlers.size === 0) {
          try {
            if (args.options?.onNoHandlersForMessage) {
              args.options.onNoHandlersForMessage({ message });
            }
          } catch {
            console.warn("onNoHandlersForMessage threw an error");
          }

          continue;
        }

        for (const handler of Array.from(handlers.values())) {
          try {
            if (args.options?.onHandlingMessage) {
              args.options.onHandlingMessage({ message });
            }
          } catch {
            console.warn("onHandlingMessage threw an error");
          }

          try {
            handler(message);
          } catch (error) {
            try {
              if (args.options?.onHandlerError) {
                args.options.onHandlerError(error as Error);
              }
            } catch {
              console.warn("onHandlerError threw an error");
            }
          }
        }
      }
    })();
  };

  const publish: Publish = async ({ topic, content, options }) => {
    if (xmtp === null) {
      throw new Error("XMTP is null, have you called start?");
    }

    try {
      if (options?.onCreatingTopic) {
        options.onCreatingTopic({ topic });
      } else {
        if (args.options?.onCreatingTopic) {
          args.options.onCreatingTopic({ topic });
        }
      }
    } catch {
      console.warn("onCreatingTopic threw an error");
    }

    let conversation: Conversation;
    try {
      conversation = await xmtp.conversations.newConversation(
        topic.peerAddress,
        topic.context,
      );
    } catch (error) {
      try {
        if (options?.onCreateTopicFailed) {
          options.onCreateTopicFailed({ topic, error: error as Error });
        } else {
          if (args.options?.onCreateTopicFailed) {
            args.options.onCreateTopicFailed({ topic, error: error as Error });
          }
        }
      } catch (error) {
        console.warn("onCreateTopicFailed threw an error");
      }

      throw error;
    }

    try {
      if (options?.onCreatedTopic) {
        options.onCreatedTopic({ topic });
      } else {
        if (args.options?.onCreatedTopic) {
          args.options.onCreatedTopic({ topic });
        }
      }
    } catch {
      console.warn("onCreatedTopic threw an error");
    }

    try {
      if (options?.onPublishingMessage) {
        options.onPublishingMessage({ topic });
      } else {
        if (args.options?.onPublishingMessage) {
          args.options.onPublishingMessage({ topic });
        }
      }
    } catch {
      console.warn("onPublishingMessage threw an error");
    }

    let published: Message;
    try {
      published = await conversation.send(content);
    } catch (error) {
      try {
        if (options?.onPublishFailed) {
          options.onPublishFailed({ topic, error: error as Error });
        } else {
          if (args.options?.onPublishFailed) {
            args.options.onPublishFailed({ topic, error: error as Error });
          }
        }
      } catch (error) {
        console.warn("onPublishFailed threw an error");
      }

      throw error;
    }

    try {
      if (options?.onPublishedMessage) {
        options.onPublishedMessage({ topic, published });
      } else {
        if (args.options?.onPublishedMessage) {
          args.options.onPublishedMessage({ topic, published });
        }
      }
    } catch {
      console.warn("onPublishedMessage threw an error");
    }

    return { published };
  };

  const subscribe: Subscribe = (handler) => {
    const id = uuidv4();

    handlers.set(id, handler);

    return {
      unsubscribe: () => {
        handlers.delete(id);
      },
    };
  };

  const stop = async () => {
    if (stream === null) {
      return;
    }

    await stream.return();
  };

  const router = (routerArgs: {
    api: { [key: string]: Brpc.BrpcProcedure };
    topic: Topic;
    options?: RouterOptions;
  }) => {
    return createRouter({
      api: routerArgs.api,
      topic: routerArgs.topic,
      publish,
      subscribe,
      options: routerArgs.options,
    });
  };

  const client = <A extends Brpc.BrpcApi>(clientArgs: {
    api: A;
    topic: Topic;
    options?: ClientOptions;
  }) => {
    return createClient({
      api: clientArgs.api,
      topic: clientArgs.topic,
      publish,
      subscribe,
      options: clientArgs.options,
    });
  };

  return {
    address: wallet.address,
    start,
    stop,
    client,
    router,
  };
};
