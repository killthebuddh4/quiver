import q from "./index.js";
import { Message } from "./types/Message.js";
import { getRequestUrl } from "./lib/getRequestUrl.js";
import { QuiverContext } from "./types/QuiverContext.js";

describe("Quiver", () => {});
it("mvp works", async function () {
  this.timeout(15000);

  const withX = q
    .middleware()
    .use((ctx: { y: string }) => {
      console.log(ctx.y);
      return {
        ...ctx,
        x: "X",
      };
    })
    .narrow(() => {
      return {
        y: "hello",
      };
    })
    .narrow((y) => y)
    .narrow((ctx: { h: string }) => {
      return ctx;
    })
    .narrow((ctx: { superman: boolean }) => {
      console.log({ h: "he" });
      return {
        ...ctx,
        h: "he",
      };
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
