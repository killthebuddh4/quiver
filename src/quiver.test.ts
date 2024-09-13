import q from "./index.js";
import { Message } from "./types/Message.js";
import { getRequestUrl } from "./lib/getRequestUrl.js";

describe("Quiver", () => {
  it("mvp works", async function () {
    this.timeout(15000);

    const auth = q
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
      });

    const secret = q.function((ctx: { user: string }) => {
      console.log("SECRET", ctx);

      return {
        ...ctx,
        secret: 42,
      };
    });

    const router = auth.router({
      secret,
      other: q.function(() => {
        return {
          other: 42,
        };
      }),
    });

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

    const result = await server(message);

    console.log(result);
  });
});
