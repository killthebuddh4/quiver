import {
  createFig,
  createQuiver,
  createClient,
  createRouter,
  createFunction,
} from "./index.js";

const CLEANUP: Array<() => void> = [];

const api = {
  add: createFunction(async ({ a, b }: { a: number; b: number }) => {
    return a + b;
  }),
  sub: createFunction(async ({ a, b }: { a: number; b: number }) => {
    return a - b;
  }),
  mul: createFunction(async ({ a, b }: { a: number; b: number }) => {
    return a * b;
  }),
  div: createFunction(async ({ a, b }: { a: number; b: number }) => {
    return a / b;
  }),
};

describe("Quiver", () => {
  afterEach(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });

  it("Can be instantiated from a private key", async function () {});

  it("Can be instantiated from a signer", async function () {
    this.timeout(15000);
  });

  it("Can be instantiated from an XMTP client", async function () {});

  it.only("Can be instantiated from an interface (Fig)", async function () {
    this.timeout(15000);

    const routerFig = await createFig();

    await (async () => {
      const quiver = createQuiver({ fig: routerFig });
      const router = createRouter("math", api);
      quiver.router(router);

      CLEANUP.push(await quiver.start());
    })();

    const fig = await createFig();
    const quiver = createQuiver({ fig });
    const client = createClient(routerFig.address, "math", api);
    quiver.client(client);

    CLEANUP.push(await quiver.start());

    const result = await client.add({ a: 1, b: 2 });

    console.log(result);
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
