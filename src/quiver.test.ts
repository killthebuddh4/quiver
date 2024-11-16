import quiver from "./index.js";

describe.only("quiver end-to-end tests", () => {
  it("hello world works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    const hello = backend.function(() => {
      return "Hello, World!";
    });

    const middleware = backend.middleware(() => {
      return {};
    });

    const router = backend.router(middleware).bind("hello", hello);

    router.listen("test");

    const frontend = quiver.q();

    const client = frontend.client<typeof router>("test", backend.address, {
      logs: {
        onSendingRequest: (request) => {
          console.log("Sending request", request);
        },
        onSendError: (request, error) => {
          console.error("Send error", request, error);
        },
      },
    });

    const response = await client.hello(undefined);

    if (!response.ok) {
      throw new Error("Response not ok");
    }

    if (response.data !== "Hello, World!") {
      throw new Error(`Expected "Hello, World!", got ${response.data}`);
    }
  });
});
