// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import q from "./index.js";

const CLEANUP: Array<() => void> = [];

describe("Quiver", () => {
  afterEach(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });
  it("Works with middleware", async function () {
    this.timeout(15000);

    const double = q
      .function()
      .use(() => console.log("Called double"))
      .bind();

    await (async () => {
      const router = q
        .router()
        .use(() => console.log("Got a request"))
        .bind({ double });

      const quiver = q
        .quiver()
        .use(() => console.log("Got a message"))
        .router(router);

      CLEANUP.push(await quiver.start());
    })();

    const client = q
      .client()
      .use(() => console.log("Got a response"))
      .bind({ double });

    const quiver = q
      .context()
      .use(() => console.log("Got a response"))
      .client(client);

    CLEANUP.push(await quiver.start());

    const result = await client.double(2);

    console.log(result);
  });

  it("Can be instantiated from a private key", async function () {});

  it("Can be instantiated from a signer", async function () {
    this.timeout(15000);
  });

  it("Can be instantiated from an XMTP client", async function () {});

  it.only("Can be instantiated from an interface (Fig)", async function () {
    this.timeout(15000);

    try {
      const routerFig = await createFig();

      await (async () => {
        console.log(`CREATING ROUTER`);

        const quiver = createQuiver({ fig: routerFig });

        const router = createNamespace("math", api);

        quiver.router(router);

        console.log(`STARTING ROUTER`);

        CLEANUP.push(await quiver.start());

        console.log(`ROUTER STARTED`);
      })();

      const fig = await createFig();

      const quiver = createQuiver({
        fig,
        hooks: { disabled: ["throw", "exit"] },
      });

      const client = createClient(routerFig.address, "math", api);

      quiver.client(client);

      CLEANUP.push(await quiver.start());

      const result = await client.add({ a: 1, b: 2 });

      console.log(result);
    } catch (e) {
      console.error(e);
    }
  });

  it("Can be instantiated from nothing", async function () {});

  it("Public functions work", async function () {
    this.timeout(15000);
  });

  it("Private functions work", async function () {
    this.timeout(15000);
  });

  it("Middleware works", async function () {
    this.timeout(15000);
  });

  it("Proxying works", async function () {});
});
