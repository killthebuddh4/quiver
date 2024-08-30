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
      console.log(Chalk.blue(`ROUTER :${name}`));
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

    const clog = (name: string) => (ctx: QuiverContext) => {
      console.log(Chalk.yellow(`CLIENT HOOK :${name}`));
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

        const router = createRouter("math", api);

        quiver.use("message", "before", "log", rlog("message"));
        quiver.use("path", "before", "log", rlog("path"));
        quiver.use("json", "before", "log", rlog("json"));
        quiver.use("request", "before", "log", rlog("request"));
        quiver.use("response", "before", "log", rlog("response"));
        quiver.use("router", "before", "log", rlog("router"));
        quiver.use("router", "throw", "log", rlog("router"));
        quiver.use("router", "exit", "log", rlog("router"));
        quiver.use("throw", "before", "log", rlog("throw"));
        quiver.use("exit", "before", "log", rlog("exit"));
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

      const client = createClient(routerFig.address, "math", api);

      quiver.use("message", "before", "log", clog("message"));
      quiver.use("path", "before", "log", clog("path"));
      quiver.use("json", "before", "log", clog("json"));
      quiver.use("request", "before", "log", clog("request"));
      quiver.use("response", "before", "log", clog("response"));
      quiver.use("router", "before", "log", clog("router"));
      quiver.use("router", "throw", "log", clog("router"));
      quiver.use("router", "exit", "log", clog("router"));
      quiver.use("throw", "before", "log", clog("throw"));
      quiver.use("exit", "before", "log", clog("exit"));
      client.use("resolve", "before", "log", clog("route"));

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
