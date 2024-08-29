import {
  createFig,
  createRouter,
  createClient,
  createQuiver,
  createFunction,
} from "./index.js";
import Chalk from "chalk";

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

    try {
      const routerFig = await createFig();

      await (async () => {
        console.log(`CREATING ROUTER`);

        const quiver = createQuiver({ fig: routerFig });
        const router = createRouter("math", api);

        quiver.router(router);

        quiver.use("message", "before", "log", (ctx) => {
          console.log(Chalk.green(`ROUTER RECEIVED MESSAGE`));
          console.log(`ID: ${ctx.received.id}`);
          console.log(`FROM: ${ctx.received.senderAddress}`);
          console.log(`CONTENT: ${ctx.received.content}`);
          console.log("\n\n\n\n");

          return ctx;
        });

        quiver.use("path", "before", "log", (ctx) => {
          console.log(`ROUTER BEFORE PATH`);
          console.log(`PATH: ${JSON.stringify(ctx.path)}`);
          console.log("\n\n\n\n");

          return ctx;
        });

        quiver.use("path", "after", "log", (ctx) => {
          console.log(`ROUTER AFTER PATH`);
          console.log(`PATH: ${JSON.stringify(ctx.path)}`);
          console.log("\n\n\n\n");

          return ctx;
        });

        quiver.use("path", "throw", "log", (ctx) => {
          console.log(`ROUTER FAILED PARSING PATH`);
          console.log(`PATH: ${JSON.stringify(ctx.throw)}`);
          console.log("\n\n\n\n");

          return ctx;
        });

        quiver.use("router", "after", "log", (ctx) => {
          console.log(ctx);
          return ctx;
        });

        console.log(`STARTING ROUTER`);

        CLEANUP.push(await quiver.start());

        console.log(`ROUTER STARTED`);
      })();

      const fig = await createFig();
      const quiver = createQuiver({ fig });
      const client = createClient(routerFig.address, "math", api);
      quiver.client(client);

      CLEANUP.push(await quiver.start());

      console.log(`CALLING CLIENT.ADD`);
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
