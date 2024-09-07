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

  const server = q.server(math);

  const message: Message = {
    id: "test-message-1",
    senderAddress: "test-client-address-1",
    conversation: {
      peerAddress: "test-peer-address-1",
      context: {
        conversationId: getRequestUrl("test-client-address-1", ["add"]),
        metadata: {},
      },
    },
    sent: new Date(),
    content: JSON.stringify({
      function: "add",
      arguments: {
        a: 1,
        b: 2,
      },
    }),
  };

  const result = await server(message);

  console.log(result);
});
