import Chalk from "chalk";

export const printQuiverContext = (label: string, ctx: any) => {
  console.log(
    `[${Chalk.blue(label)}] ${JSON.stringify({
      ...ctx,
      received: {
        id: ctx.received.id,
        senderAddress: ctx.received.senderAddress,
        conversation: {
          peerAddress: ctx.received.conversation.peerAddress,
          context: {
            conversationId: ctx.received.conversation.context?.conversationId,
            metadata: ctx.received.conversation.context?.metadata,
          },
        },
        content: ctx.received.content,
      },
    })}`,
  );
};
