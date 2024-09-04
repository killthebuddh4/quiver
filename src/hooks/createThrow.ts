import { QuiverHandler } from "../types/QuiverHandler.js";
import { QuiverError } from "../types/QuiverError.js";

export const createThrow = (): QuiverHandler => {
  return async (ctx) => {
    if (ctx.throw === undefined) {
      return ctx;
    }

    const err: QuiverError = {
      id: ctx.received.id,
      ok: false,
      ...ctx.throw,
    };

    let content;
    try {
      content = JSON.stringify(err);
    } catch (error) {
      throw new Error(`Failed to stringify throw`);
    }

    if (ctx.url === undefined) {
      throw new Error(`Path not found in context`);
    }

    const conversationId = `${ctx.url.quiver}/${ctx.url.version}/responses/${ctx.address}/${ctx.url.namespace}/${ctx.url.function}`;

    const sent = await ctx.fig.send({
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
