import { QuiverHandler } from "../types/QuiverHandler.js";

export const createReturn = (): QuiverHandler => {
  return async (ctx) => {
    if (ctx.return === undefined) {
      return ctx;
    }

    ctx.response = {
      id: ctx.received.id,
      ok: true,
      ...ctx.return,
    };

    let content;
    try {
      content = JSON.stringify(ctx.response);
    } catch (error) {
      throw new Error(`Failed to stringify ctx.return`);
    }

    if (ctx.url === undefined) {
      throw new Error(`Path not found in context`);
    }

    const conversationId = `${ctx.url.quiver}/${ctx.url.version}/responses/${ctx.state.fig.address}/${ctx.url.path.join("/")}`;

    const sent = await ctx.state.fig.publish({
      conversation: {
        peerAddress: ctx.received.conversation.peerAddress,
        context: {
          conversationId,
          metadata: {},
        },
      },
      content,
    });

    ctx.sent = sent;

    return ctx;
  };
};
