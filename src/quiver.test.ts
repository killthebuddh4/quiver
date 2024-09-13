import q from "./index.js";
import { Message } from "./types/Message.js";
import { getRequestUrl } from "./lib/getRequestUrl.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { Maybe } from "./types/util/Maybe.js";

type Root = {
  compile: (path?: string[]) => Array<(ctx: QuiverContext) => QuiverContext>;
  exec: (path?: string[]) => Maybe<(i: any, ctx: any) => any>;
};

describe("Quiver", () => {
  it("mvp works", async function () {
    this.timeout(15000);

    const router = q
      .middleware((ctx: { user: string }) => {
        return {
          ...ctx,
          authed: (ctx.user = "authed-user-1"),
        };
      })
      .parallel((ctx: { pass: string }) => {
        return {
          ...ctx,
        };
      })
      .serial(() => {
        return {
          x: 100,
        };
      })
      .router({
        secret: q
          .middleware((ctx: { user: string }) => {
            return {
              ...ctx,
              secret: 42,
            };
          })
          .function((ctx) => {
            console.log("SECRET", ctx);
          }),
      });

    const root: Root = router;

    const app = q.app(root);

    const message: Message = {
      id: "test-message-1",
      senderAddress: "test-client-address-1",
      conversation: {
        peerAddress: "test-peer-address-1",
        context: {
          conversationId: getRequestUrl("test-client-address-1", ["private"]),
          metadata: {},
        },
      },
      sent: new Date(),
      content: JSON.stringify({
        // TODO, this doesn't actually do anything, the URL is being use for the
        // function lookup.
        function: "private",
        arguments: { value: "ACHILLES AND SOME" },
      }),
    };
  });
});
