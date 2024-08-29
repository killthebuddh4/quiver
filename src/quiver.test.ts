import {
  createFig,
  createRouter,
  createClient,
  createQuiver,
  createFunction,
  QuiverContext,
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

    const rlog = (name: string) => (ctx: QuiverContext) => {
      console.log(Chalk.blue(`ROUTER HOOK :${name}`));
      console.log(
        JSON.stringify(
          {
            ...ctx,
            received: ctx.received.content,
          },
          null,
          2,
        ),
      );
      return ctx;
    };

    const qlog = (name: string) => (ctx: QuiverContext) => {
      console.log(Chalk.green(`QUIVER HOOK :${name}`));
      console.log(
        JSON.stringify(
          {
            ...ctx,
            received: ctx.received.content,
          },
          null,
          2,
        ),
      );
      return ctx;
    };

    try {
      const routerFig = await createFig();

      await (async () => {
        console.log(`CREATING ROUTER`);

        const quiver = createQuiver({ fig: routerFig });

        quiver.use("message", "before", "log", qlog("message"));
        quiver.use("path", "before", "log", qlog("path"));
        quiver.use("json", "before", "log", qlog("json"));
        quiver.use("request", "before", "log", qlog("request"));
        quiver.use("response", "before", "log", qlog("response"));
        quiver.use("router", "before", "log", qlog("router"));
        quiver.use("router", "throw", "log", qlog("router"));
        quiver.use("router", "exit", "log", qlog("router"));
        quiver.use("throw", "before", "log", qlog("throw"));
        quiver.use("exit", "before", "log", qlog("exit"));

        const router = createRouter("math", api);

        router.use("route", "before", "log", rlog("route"));
        router.use("dispatch", "before", "log", rlog("dispatch"));
        router.use("function", "before", "log", rlog("function"));
        router.use("return", "before", "log", rlog("return"));
        router.use("throw", "before", "log", rlog("throw"));
        router.use("exit", "before", "log", rlog("exit"));

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

      quiver.use("message", "before", "log", (ctx) => {
        console.log(Chalk.blue(`CLIENT RECEIVED MESSAGE`));
        console.log(`ID: ${ctx.received.id}`);
        console.log(`FROM: ${ctx.received.senderAddress}`);
        console.log(`CONTENT: ${ctx.received.content}`);
        console.log("\n\n\n\n");
        return ctx;
      });

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
