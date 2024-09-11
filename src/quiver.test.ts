import q from "./index.js";
import { Message } from "./types/Message.js";
import { getRequestUrl } from "./lib/getRequestUrl.js";

/*

logged

{
  public: {
    describe: //
    join: //
}

admin: {
  destroy: //
. }

members: {
  post: //
}

*/

describe("Quiver", () => {
  it("mvp works", async function () {
    this.timeout(15000);

    const logger = q.middleware().use((ctx) => {
      console.log(ctx);
    });

    const join = (_, ctx) => {
      console.log(`Ctx.message.sender joined`);
    };

    const app = q.router();

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
