/* eslint-disable @typescript-eslint/no-unused-vars */

import q from "./index.js";
import { Equal } from "./types/test/Equal.js";
import { exec } from "./lib/exec.js";
import { MwCtxIn } from "./types/util/MwCtxIn.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { MwCtxOut } from "./types/util/MwCtxOut.js";
import { Expect } from "./types/test/Expect.js";
import { Message } from "./types/Message.js";
import { RouterCtxIn } from "./types/util/RouterCtxIn.js";
import { RouterCtxOut } from "./types/util/RouterCtxOut.js";

const CLEANUP: Array<{ stop: () => void }> = [];

describe("Quiver", () => {
  afterEach(() => {
    while (CLEANUP.length > 0) {
      CLEANUP.pop()?.stop();
    }
  });

  /* *************************************************************************
   *
   * ROUTER
   *
   * ************************************************************************/

  it("typing with routers works as expected", async function () {
    const r0 = q
      .middleware(() => {
        return { user: "test-user-1" };
      })
      .router();

    /* Specified and compatible output -> input */

    const f0 = q
      .middleware((ctx: { user: string }) => {
        return ctx;
      })
      .function(() => null);

    const r1 = r0.use("f0", f0);

    type r1ctxin = Expect<Equal<RouterCtxIn<typeof r1>, undefined>>;

    type r1ctxout = Expect<Equal<RouterCtxOut<typeof r1>, { user: string }>>;

    /* Specified and incompatible output -> input */

    const f1 = q
      .middleware((ctx: { user: boolean }) => {
        return ctx;
      })
      .function(() => null);

    /* @ts-expect-error boolean is not assignable to string */

    r0.use("f1", f1);

    /* extended input */

    const f2 = q
      .middleware((ctx: { user: string; x: number }) => {
        return ctx;
      })
      .function(() => null);

    const r2 = r0.use("f2", f2);

    type r2ctxin = Expect<Equal<RouterCtxIn<typeof r2>, { x: number }>>;

    type r2ctxout = Expect<Equal<RouterCtxOut<typeof r2>, { user: string }>>;

    /* Same as above but with routers */

    const r3 = q
      .middleware(() => {
        return { user: "test-user-1" };
      })
      .router();

    const r4 = r3.use("f0", f0);

    // .use("f2", f2);
  });

  /* *************************************************************************
   *
   * q
   *
   * ************************************************************************/

  // TODO

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

    const a = lhs.extend(
      q.middleware((ctx: { y: string }) => {
        return { z: ctx.y };
      }),
    );

    type actxin = Expect<Equal<MwCtxIn<typeof a>, { y: string }>>;

    type actxout = Expect<Equal<MwCtxOut<typeof a>, { y: string; z: string }>>;

    /* LHS extends RHS */

    const b = lhs.extend(
      q.middleware((ctx: { y: number | string | null }) => {
        return { z: ctx.y };
      }),
    );

    type bctxin = Expect<Equal<MwCtxIn<typeof b>, { y: string | null }>>;

    type bctxout = Expect<
      Equal<MwCtxOut<typeof b>, { y: string | null; z: string | number | null }>
    >;

    /* Disjoint input */

    const c = lhs.extend(
      q.middleware((ctx: { x: string }) => {
        return { z: ctx.x };
      }),
    );

    type cctxin = Expect<
      Equal<MwCtxIn<typeof c>, { x: string; y: string | null }>
    >;

    type cctxout = Expect<
      Equal<MwCtxOut<typeof c>, { x: string; y: string | null; z: string }>
    >;

    /* Extending using undefined input */

    const d = lhs.extend(
      q.middleware(() => {
        return { z: 10 };
      }),
    );

    type dctxin = Expect<Equal<MwCtxIn<typeof d>, { y: string | null }>>;

    type dctxout = Expect<
      Equal<MwCtxOut<typeof d>, { y: string | null; z: number }>
    >;

    /* Extending an undefined input */

    const unspec = q.middleware(() => {
      return { baz: "baz" };
    });

    const e = unspec.extend(
      q.middleware((ctx: { y: string }) => {
        return { z: ctx.y };
      }),
    );

    type ectxin = Expect<Equal<MwCtxIn<typeof e>, { y: string }>>;

    type ectxout = Expect<
      Equal<MwCtxOut<typeof e>, { y: string; z: string; baz: string }>
    >;

    /* Extending an undefined input with an undefined input */

    const f = unspec.extend(
      q.middleware(() => {
        return { z: 10 };
      }),
    );

    type fctxin = Expect<Equal<MwCtxIn<typeof f>, undefined>>;

    type fctxout = Expect<
      Equal<MwCtxOut<typeof f>, { baz: string; z: number }>
    >;

    /* Unsatisfiable input */

    lhs.extend(
      /* @ts-expect-error string | null & undefined -> never */
      q.middleware((ctx: { y: undefined }) => {
        return { bar: ctx.y };
      }),
    );

    /* Overlapping output */

    lhs.extend(
      /* @ts-expect-error y is already in the output */
      q.middleware(() => {
        return { y: "y" };
      }),
    );
  });

  /* *************************************************************************
   *
   * PIPE MIDDLEWARE
   *
   * ************************************************************************/

  describe("pipe with disjoint inputs, minimal", () => {
    const lhs = q.middleware((ctx: { y: string }) => {
      return ctx;
    });

    const rhs = lhs.pipe(q.middleware((ctx: { x: string }) => ctx));

    it("types work as expected", async function () {
      type ctxin = Expect<Equal<MwCtxIn<typeof rhs>, { y: string; x: string }>>;
      type ctxout = Expect<
        Equal<MwCtxOut<typeof rhs>, { y: string; x: string }>
      >;
    });

    it("exec works as expected", async function () {
      const ret = await exec(
        rhs.function(() => null),
        [],
        { y: "y", x: "x" },
      );

      if (ret.x !== "x") {
        throw new Error(`Expected x to be "x", got ${ret.x}`);
      }

      if (ret.y !== "y") {
        throw new Error(`Expected y to be "y", got ${ret.y}`);
      }

      console.log("ret", ret);
    });
  });

  describe("pipe with disjoint inputs and external pass-through", () => {
    const lhs = q.middleware((ctx: { y: string }) => {
      return ctx;
    });

    const rhs = lhs.pipe(q.middleware((ctx: { x: string }) => ctx));

    it("types work as expected", async function () {
      type ctxin = Expect<Equal<MwCtxIn<typeof rhs>, { y: string; x: string }>>;
      type ctxout = Expect<
        Equal<MwCtxOut<typeof rhs>, { y: string; x: string }>
      >;
    });

    it("exec works as expected", async function () {
      const ret = await exec(
        rhs.function(() => null),
        [],
        { z: "z", y: "y", x: "x" },
      );

      if (ret.x !== "x") {
        throw new Error(`Expected x to be "x", got ${ret.x}`);
      }

      if (ret.y !== "y") {
        throw new Error(`Expected y to be "y", got ${ret.y}`);
      }

      if (ret.z !== "z") {
        throw new Error(`Expected z to be "z", got ${ret.z}`);
      }

      console.log("ret", ret);
    });
  });

  describe("middleware.extend", () => {
    it("defined -> undefined is allowed", async function () {
      const lhs = q.middleware((ctx: { y: string }) => {
        return ctx;
      });

      const rhs = q.middleware(() => {
        return { x: "x" };
      });

      lhs.pipe(rhs);
    });

    it("defined -> undefined has the right return type", async function () {
      const lhs = q.middleware((ctx: { y: string }) => {
        return ctx;
      });

      const rhs = q.middleware(() => {
        return { x: "x" };
      });

      const nxt = lhs.pipe(rhs);

      type test = Expect<Equal<MwCtxIn<typeof nxt>, { y: string }>>;
    });

    const lhs = q.middleware((ctx: { y: string }) => {
      return ctx;
    });

    const rhs = lhs.pipe(q.middleware((ctx: { x: string }) => ctx));

    it("types work as expected", async function () {
      type ctxin = Expect<Equal<MwCtxIn<typeof rhs>, { y: string; x: string }>>;
      type ctxout = Expect<
        Equal<MwCtxOut<typeof rhs>, { y: string; x: string }>
      >;
    });

    it("exec works as expected", async function () {
      const ret = await exec(
        rhs.function(() => null),
        [],
        { z: "z", y: "y", x: "x" },
      );

      if (ret.x !== "x") {
        throw new Error(`Expected x to be "x", got ${ret.x}`);
      }

      if (ret.y !== "y") {
        throw new Error(`Expected y to be "y", got ${ret.y}`);
      }

      if (ret.z !== "z") {
        throw new Error(`Expected z to be "z", got ${ret.z}`);
      }

      console.log("ret", ret);
    });
  });

  it("pipe typing works as expected", async function () {
    const lhs = q.middleware((ctx: { y: string | null }) => {
      return { ...ctx, k: 100 };
    });

    /* Disjoint inputs */

    /* LHS output extends RHS input */

    const b = lhs.pipe(q.middleware((ctx: { y: string | null }) => ctx));

    type bctxin = Expect<Equal<MwCtxIn<typeof b>, { y: string | null }>>;

    type bctxout = Expect<
      Equal<MwCtxOut<typeof b>, { y: string | null; k: number }>
    >;

    /* Partial overlap */

    const c = lhs.pipe(
      q.middleware((ctx: { y: string | null; o: boolean }) => {
        return { ...ctx };
      }),
    );

    type cctxin = Expect<
      Equal<MwCtxIn<typeof c>, { y: string | null; o: boolean }>
    >;

    type cctxout = Expect<
      Equal<MwCtxOut<typeof c>, { y: string | null; o: boolean; k: number }>
    >;

    /* undefined input */

    const d = lhs.pipe(
      q.middleware(() => {
        return { z: 10 };
      }),
    );

    type dctxin = Expect<Equal<MwCtxIn<typeof d>, { y: string | null }>>;

    type dctxout = Expect<
      Equal<MwCtxOut<typeof d>, { y: string | null; k: number; z: number }>
    >;

    /* Piping an undefined input */

    const unspec = q.middleware(() => {
      return { baz: "baz" };
    });

    const e = unspec.pipe(
      q.middleware((ctx: { y: string }) => {
        return { z: ctx.y };
      }),
    );

    type ectxin = Expect<Equal<MwCtxIn<typeof e>, { y: string }>>;

    type ectxout = Expect<
      Equal<MwCtxOut<typeof e>, { z: string; baz: string }>
    >;

    /* Piping an undefined input to an undefined input */

    const f = unspec.pipe(
      q.middleware(() => {
        return { z: 10 };
      }),
    );

    type fctxin = Expect<Equal<MwCtxIn<typeof f>, undefined>>;

    type fctxout = Expect<
      Equal<MwCtxOut<typeof f>, { baz: string; z: number }>
    >;

    /* RHS input extends LHS output */

    lhs.pipe(
      /* @ts-expect-error RHS needs more specific type than LHS provides */
      q.middleware((ctx: { y: string }) => {
        return { ...ctx };
      }),
    );

    /* LHS input and RHS output unsatisfiable */

    lhs.pipe(
      /* @ts-expect-error RHS needs more specific type than LHS provides */
      q.middleware((ctx: { y: boolean }) => {
        return { ...ctx };
      }),
    );
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
   * E2E EXAMPLES
   *
   * ************************************************************************/
});
