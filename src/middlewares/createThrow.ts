import { QuiverHandler } from "../types/QuiverHandler.js";

export const createThrow = (): QuiverHandler => {
  return (x) => x;
};
//   const handler = async (ctx: QuiverContext, ctrl: QuiverController) => {
//     if (ctx.throw === undefined) {
//       return ctx;
//     }

//     const err: QuiverError = {
//       id: ctx.received.id,
//       ok: false,
//       ...ctx.throw,
//     };

//     let content;
//     try {
//       content = JSON.stringify(err);
//     } catch (error) {
//       throw new Error(`Failed to stringify throw`);
//     }

//     if (ctx.url === undefined) {
//       throw new Error(`Path not found in context`);
//     }

//     const conversationId = `${ctx.url.quiver}/${ctx.url.version}/responses/${ctx.address}/${ctx.url.namespace}/${ctx.url.function}`;

//     const sent = await ctrl.send({
//       conversation: {
//         peerAddress: ctx.received.conversation.peerAddress,
//         context: {
//           conversationId,
//           metadata: {},
//         },
//       },
//       content,
//     });

//     ctx.sent = sent;

//     return ctx;
//   };

//   return { name: "throw", handler };
// };
