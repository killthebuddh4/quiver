import q from "./index.js";
import { Message } from "./types/Message.js";
import { getRequestUrl } from "./lib/getRequestUrl.js";

describe("Quiver", () => {});
it("app, function, server works", async function () {
  this.timeout(15000);

  const add = q.function(
    (ctx) => ctx,
    (input: { a: number; b: number }) => {
      return input.a + input.b;
    },
  );

  const sub = q.function(
    (ctx) => ctx,
    (input: { a: number; b: number }) => {
      return input.a - input.b;
    },
  );

  const math = q.app((ctx) => ctx, {
    add,
    sub,
  });

  const app = q.app((ctx: object) => ({ ...ctx, secret: "ACHILLES" }), {
    public: math,
    private: q.function(
      (ctx: { secret: string }) => ctx,
      (input: { value: string }, ctx) => {
        console.log("Calling private function with secret", ctx.secret);
        console.log("Input is", input);
        return `The big secret is ${ctx.secret.length > input.value.length}`;
      },
    ),
  });

  const server = q.server(app);

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
