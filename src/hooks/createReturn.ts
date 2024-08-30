import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverController } from "../types/QuiverController.js";

export const createReturn = (): QuiverMiddleware => {
  const handler = async (ctx: QuiverContext, ctrl: QuiverController) => {
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

    if (ctx.path === undefined) {
      throw new Error(`Path not found in context`);
    }

    const conversationId = `${ctx.path.quiver}/${ctx.path.version}/responses/${ctx.address}/${ctx.path.namespace}/${ctx.path.function}`;

    const sent = await ctrl.send({
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

  return { name: "return", handler };
};