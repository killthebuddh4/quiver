/* eslint-disable @typescript-eslint/no-unused-vars */

import q from "./index.js";
import { Equal } from "./types/test/Equal.js";
import { MwCtxIn } from "./types/util/MwCtxIn.js";
import { MwCtxOut } from "./types/util/MwCtxOut.js";
import { Expect } from "./types/test/Expect.js";
import { Message } from "./types/Message.js";

const CLEANUP: Array<{ stop: () => void }> = [];

describe("Quiver", () => {
  afterEach(() => {
    while (CLEANUP.length > 0) {
      CLEANUP.pop()?.stop();
    }
  });

  /* *************************************************************************
   *
   * INIT MIDDLEWARE
   *
   * ************************************************************************/

  it("unspecified input init can be extended", async function () {
    const mw = q.middleware(() => {
      return { foo: "foo" };
    });

    mw.extend((ctx: { bar: string }) => {
      return { ...ctx };
    });
  });

  it("specified input init can be extended", async function () {
    const mw = q.middleware((ctx: { foo: string }) => {
      return ctx;
    });

    mw.extend((ctx: { bar: string }) => {
      return { ...ctx };
    });
  });

  it("unspecified input init can be piped", async function () {
    const mw = q.middleware(() => {
      return { foo: "foo" } as const;
    });

    mw.pipe((ctx: { foo: string; bar: string }) => {
      return { ...ctx, z: null };
    });
  });

  it("specified input init can be piped", async function () {
    const mw = q.middleware((ctx: { foo: string }) => {
      return ctx;
    });

    mw.pipe((ctx: { foo: string; bar: string }) => {
      return { ...ctx, z: null };
    });
  });

  /* *************************************************************************
   *
   * EXTEND MIDDLEWARE
   *
   * ************************************************************************/

  it("extend typing works as expected", async function () {
    const lhs = q.middleware((ctx: { y: string | null }) => {
      return ctx;
    });

    /* RHS extends LHS */

    const a = lhs.extend((ctx: { y: string }) => {
      return { z: ctx.y };
    });

    type actxin = Expect<Equal<MwCtxIn<typeof a>, { y: string }>>;

    type actxout = Expect<Equal<MwCtxOut<typeof a>, { y: string; z: string }>>;

    /* LHS extends RHS */

    const b = lhs.extend((ctx: { y: number | string | null }) => {
      return { z: ctx.y };
    });

    type bctxin = Expect<Equal<MwCtxIn<typeof b>, { y: string | null }>>;

    type bctxout = Expect<
      Equal<MwCtxOut<typeof b>, { y: string | null; z: string | number | null }>
    >;

    /* Disjoint input */

    const c = lhs.extend((ctx: { x: string }) => {
      return { z: ctx.x };
    });

    type cctxin = Expect<
      Equal<MwCtxIn<typeof c>, { x: string; y: string | null }>
    >;

    type cctxout = Expect<
      Equal<MwCtxOut<typeof c>, { x: string; y: string | null; z: string }>
    >;

    /* Unspecified input */

    const d = lhs.extend(() => {
      return { z: 10 };
    });

    type dctxin = Expect<Equal<MwCtxIn<typeof d>, { y: string | null }>>;

    type dctxout = Expect<
      Equal<MwCtxOut<typeof d>, { y: string | null; z: number }>
    >;

    /* Unsatisfiable input */

    /* @ts-expect-error string | null & undefined -> never */
    lhs.extend((ctx: { y: undefined }) => {
      return { bar: ctx.y };
    });

    /* Overlapping output */
    /* @ts-expect-error y is already in the output */

    lhs.extend(() => {
      return { y: "y" };
    });
  });

  /* *************************************************************************
   *
   * PIPE MIDDLEWARE
   *
   * ************************************************************************/

  it("pipe typing works as expected", async function () {
    const lhs = q.middleware((ctx: { y: string | null }) => {
      return { ...ctx, k: 100 };
    });

    /* Disjoint inputs */

    const a = lhs.pipe((ctx: { x: string }) => {
      return { ...ctx };
    });

    type actxin = Expect<
      Equal<MwCtxIn<typeof a>, { y: string | null; x: string }>
    >;

    type actxout = Expect<
      Equal<MwCtxOut<typeof a>, { y: string | null; x: string; k: number }>
    >;

    /* LHS output extends RHS input */

    const b = lhs.pipe((ctx: { y: number | string | null }) => {
      return { ...ctx };
    });

    type bctxin = Expect<Equal<MwCtxIn<typeof b>, { y: string | null }>>;

    type bctxout = Expect<
      Equal<MwCtxOut<typeof b>, { y: string | null; k: number }>
    >;

    /* Partial overlap */

    const c = lhs.pipe((ctx: { y: string | null; o: boolean }) => {
      return { ...ctx };
    });

    type cctxin = Expect<
      Equal<MwCtxIn<typeof c>, { y: string | null; o: boolean }>
    >;

    type cctxout = Expect<
      Equal<MwCtxOut<typeof c>, { y: string | null; o: boolean; k: number }>
    >;

    /* Unspecified input */

    const d = lhs.pipe(() => {
      return { z: 10 };
    });

    type dctxin = Expect<Equal<MwCtxIn<typeof d>, { y: string | null }>>;

    type dctxout = Expect<
      Equal<MwCtxOut<typeof d>, { y: string | null; k: number; z: number }>
    >;

    /* RHS input extends LHS output
     * @ts-expect-error RHS needs more specific type than LHS provides */

    lhs.pipe((ctx: { y: string }) => {
      return { ...ctx };
    });

    /* LHS input and RHS output unsatisfiable
     * @ts-expect-error string | null & undefined -> never */

    lhs.pipe((ctx: { y: boolean }) => {
      return { ...ctx };
    });
  });

  /* *************************************************************************
   *
   * FUNCTIONS
   *
   * ************************************************************************/

  it("typing with functions works as expected", async function () {
    /* TODO, the input/output types for QuiverMiddleware need to include
     * QuiverContext. Right now you can work around by piping all middlewares
     * from a "root" middleware that has the QuiverContext type */

    /*
     *
     * TYPE INFERENCE WITH MIDDLEWARE AND NO ANNOTATIONS
     *
     */

    const mw = q.middleware(() => {
      return { user: "test-user-1" };
    });

    const fn0 = mw.function(() => {
      return "Hello, world!";
    });

    const fn1 = mw.function((i) => {
      return i;
    });

    const fn2 = mw.function((i, ctx) => {
      return `${i} ${ctx.user}`;
    });

    /*
     *
     * TYPE INFERENCE WITH MIDDLEWARE AND ANNOTATIONS
     *
     */

    /* middleware output extends ctx annotation */

    const fn3 = mw.function((i: string, ctx: { user: string | null }) => {
      return `${i} ${ctx.user}`;
    });

    /* middleware output does not extend ctx annotation
     * @ts-expect-error boolean is not assignable to string | null */

    const fn4 = mw.function((i: string, ctx: { user: boolean }) => {
      return `${i} ${ctx.user}`;
    });

    /*
     *
     * TYPE INFERENCE WITHOUT MIDDLEWARE NOR ANNOTATIONS
     *
     */

    const fn5 = q.function(() => {
      return "Hello, world!";
    });

    const fn6 = q.function((i) => {
      return i;
    });

    const fn7 = q.function((i, ctx) => {
      return `${i} ${ctx.message}`;
    });

    /*
     *
     * TYPE INFERENCE WITHOUT MIDDLEWARE AND WITH ANNOTATIONS
     *
     */

    /* QuiverContext extends ctx annotation */

    const fn8 = q.function((i: string, ctx: { message: Message }) => {
      return `${i} ${ctx.message}`;
    });

    /* QuiverContext does not extend ctx annotation
     * @ts-expect-error boolean is not assignable to Message */

    const fn9 = q.function((i: string, ctx: { message: boolean }) => {
      return `${i} ${ctx.message}`;
    });

    /* @ts-expect-error QuiverContext is not assignable to { x: number }  */

    const fn10 = q.function((i: string, ctx: { x: number }) => {
      return `${i} ${ctx.x}`;
    });
  });

  /* *************************************************************************
   *
   * ROUTERS
   *
   * ************************************************************************/

  it("typing with routers works as expected", async function () {
    const mw = q.middleware(() => {
      return { user: "test-user-1" };
    });

    const router = q.router(mw);

    router
      .pipe("a", () => {})
      .pipe("b", () => {})
      .pipe("c", () => {});

    /*
     *
     * TYPE INFERENCE WITH MIDDLEWARE AND FUNCTION ROUTES
     *
     */

    /*
     *
     * TYPE INFERENCE WITH MIDDLEWARE AND ROUTER ROUTES
     *
     */
  });

  /* *************************************************************************
   *
   * E2E EXAMPLES
   *
   * ************************************************************************/

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
