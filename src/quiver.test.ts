import q from "./index.js";
import { Message } from "./types/Message.js";
import { getRequestUrl } from "./lib/getRequestUrl.js";

describe("Quiver", () => {});
it("mvp works", async function () {
  this.timeout(15000);

  const withUser = q.middleware().use(() => {
    return {
      user: "test-user-1",
    };
  });

  const needsUser = q.middleware().use((ctx: { user: string }) => {
    return ctx;
  });

  const needsPass = q.middleware().use((ctx: { pass: string }) => {
    return ctx;
  });

  const goodbye = q.router(needsPass)({
    to: (from: string, ctx) => {
      return `Goodbye, ${ctx.pass} from ${from}`;
    },
  });

  const withPass = q.middleware().use((ctx: { user: string }) => {
    return {
      ...ctx,
      pass: "test-pass-1",
    };
  });

  const router = q.router(withUser)({
    hello: (from: string, ctx) => {
      return `Hello, ${ctx.user} from ${from}`;
    },
    authed: q.router(withPass)({
      goodbye,
      other: (i, ctx) => {
        return `Other, ${ctx.pass}`;
      },
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
