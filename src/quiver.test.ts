// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import q from "./index.js";
import { Message } from "./types/Message.js";
import { getRequestUrl } from "./lib/getRequestUrl.js";

describe("Quiver", () => {});
it("mvp works", async function () {
  this.timeout(15000);

  const auth = q
    .middleware("auth")
    .exit((x) => x)
    .before((x) => x)
    .after((x) => x);

  const logger = q
    .middleware("logger")
    .use((x) => x)
    .throw((x) => x)
    .exit((x) => x)
    .before((x) => x)
    .after((x) => x);

  const errors = q.middleware("errors").exit((x) => x);

  const middleware = q
    .middleware(auth)
    .push(logger)
    .push(errors)
    .push(logger)
    .push(auth)
    .unshift(logger);

  const hello = q.function(middleware)(() => "Hello, World!");

  const app = q.app(middleware)({ hello });

  q.run()(app);

  CLEANUP.push(await quiver.start());

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
