import { QuiverError } from "../types/QuiverError.js";
import { QuiverMiddleware } from "../types/QuiverMiddleware.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverController } from "../types/QuiverController.js";

export const createThrow = (): QuiverMiddleware => {
  const handler = async (ctx: QuiverContext, ctrl: QuiverController) => {
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

  return { name: "throw", handler };
};
