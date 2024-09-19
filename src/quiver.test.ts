import q from "./index.js";

const CLEANUP: Array<{ stop: () => void }> = [];

describe("Quiver", () => {
  afterEach(() => {
    while (CLEANUP.length > 0) {
      CLEANUP.pop()?.stop();
    }
  });

  // init, extend, pipe
  it("empty init can be extended", async function () {
    const mw = q.middleware(() => {
      return { foo: "foo" };
    });

    mw.extend((ctx: { bar: string }) => {
      return { ...ctx };
    });
  });

  it("specified init can be extended", async function () {
    const mw = q.middleware((ctx: { foo: string }) => {
      return ctx;
    });

    mw.extend((ctx: { bar: string }) => {
      return { ...ctx };
    });
  });

  it("empty init can be piped", async function () {
    const mw = q.middleware(() => {
      return { foo: "foo" } as const;
    });

    mw.pipe((ctx: { foo: string; bar: string }) => {
      return { ...ctx, z: null };
    });
  });

  it("specified init can be piped", async function () {
    const mw = q.middleware((ctx: { foo: string }) => {
      return ctx;
    });

    mw.pipe((ctx: { foo: string; bar: string }) => {
      return { ...ctx, z: null };
    });
  });

  it("overlapping extension works with valid input type", async function () {
    const mw = q.middleware((ctx: { foo: string | null }) => {
      return ctx;
    });

    mw.extend((ctx: { foo: string }) => {
      return { bar: ctx.foo };
    });
  });

  it("overlapping extension fails with invalid input type", async function () {
    const mw = q.middleware((ctx: { foo: string }) => {
      return ctx;
    });

    // @ts-expect-error null & string -> never
    mw.extend((ctx: { foo: null }) => {
      return { bar: ctx.foo };
    });
  });

  // init, pipe, extend

  it("minimal middleware example", async function () {
    this.timeout(10000);

    const provider = await q.provider().start();
    const namespace = "quiver-test-min";
    const address = provider.address;

    CLEANUP.push(provider);

    const mw = q.middleware(() => {
      return { foo: "foo" };
    });

    const fn = mw.function((i, ctx) => {
      return ctx.foo;
    });

    const app = await fn.app(namespace).listen(provider);

    await (async () => {
      const provider = await q.provider().start();

      CLEANUP.push(provider);

      try {
        const client = q.client<typeof app>(provider, namespace, address);
        const response = await client();

        if (response.data !== "Hello, world!") {
          throw new Error(`Expected "Hello, world!", got ${response.data}`);
        }

        console.log(response.data);
      } catch (e) {
        console.error(e);
        throw e;
      }
    })();
  });

  it("minimal function example", async function () {
    this.timeout(10000);

    const provider = await q.provider().start();
    const namespace = "quiver-test-min";
    const address = provider.address;

    CLEANUP.push(provider);

    const app = await q
      .function(() => `Hello, world!`)
      .app(namespace)
      .listen(provider);

    await (async () => {
      const provider = await q.provider().start();

      CLEANUP.push(provider);

      try {
        const client = q.client<typeof app>(provider, namespace, address);
        const response = await client();

        if (response.data !== "Hello, world!") {
          throw new Error(`Expected "Hello, world!", got ${response.data}`);
        }

        console.log(response.data);
      } catch (e) {
        console.error(e);
        throw e;
      }
    })();
  });

  it("minimal router example", async function () {
    this.timeout(10000);

    const provider = await q.provider().start();
    const namespace = "quiver-test-min";
    const address = provider.address;

    CLEANUP.push(provider);

    const app = await q
      .router({
        a: q.function(() => "a"),
        b: q.function(() => "b"),
        c: q.function(() => "c"),
      })
      .app(namespace)
      .listen(provider);

    await (async () => {
      const provider = await q.provider().start();

      CLEANUP.push(provider);

      try {
        const client = q.client<typeof app>(provider, namespace, address);
        const response = await client.a();

        if (response.data !== "a") {
          throw new Error(`Expected "a", got ${response.data}`);
        }

        console.log(response.data);
      } catch (e) {
        console.error(e);
        throw e;
      }
    })();
  });
});
