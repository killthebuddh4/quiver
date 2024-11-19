import quiver from "./index.js";
import { ResultCtx } from "./types/middleware/ResultCtx.js";
import { Equal } from "./types/test/Equal.js";
import { Expect } from "./types/test/Expect.js";
import { RouterCtxIn } from "./types/router/RouterCtxIn.js";
import { Resolve } from "./types/util/Resolve.js";
import { RouterCtxOut } from "./types/router/RouterCtxOut.js";

describe("router.router types work", () => {
  const q = quiver.q();

  after(() => {
    q.kill();
  });

  it("valid routes do not result in type errors", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router().middleware(
      q.middleware((ctx: { password: string }) => {
        return {};
      }),
    );

    router.router("/", route);
  });

  it("invalid routes result in type errors", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router().middleware(
      q.middleware((ctx: { password: number }) => {
        return {};
      }),
    );

    // @ts-expect-error
    router.router("/", route);
  });

  it("router.router(route) yields the expected CtxIn type", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router().middleware(
      q.middleware((ctx: { token: string }) => {
        return {};
      }),
    );

    const routed = router.router("/", route);

    type Expected = { user: string; token: string };
    type Actual = RouterCtxIn<typeof routed>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("router.router(route) yields the expected CtxOut type", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router().middleware(
      q.middleware((ctx: { token: string }) => {
        return {};
      }),
    );

    const routed = router.router("/", route);

    type Expected = { password: string };
    type Actual = RouterCtxOut<typeof routed>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("router.router(route) yields the expected ResultCtx type", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router().middleware(
      q.middleware((ctx: { token: string }) => {
        return {};
      }),
    );

    const routed = router.router("/", route);

    type Expected = { password: string; token: string; user: string };
    type Actual = Resolve<
      ResultCtx<RouterCtxIn<typeof routed>, RouterCtxOut<typeof routed>>
    >;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("router.function types work", () => {
  const q = quiver.q();

  after(() => {
    q.kill();
  });

  it("valid routes do not result in type errors", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const f = q.function((i: undefined, ctx: { password: string }) => 10);

    router.function("/", f);
  });

  it("invalid routes result in type errors", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const f = q.function((i: undefined, ctx: { password: number }) => 10);

    // @ts-expect-error
    router.function("/", f);
  });

  it("router.function(route) yields the expected CtxIn type", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.function((i: undefined, ctx: { token: string }) => {
      return {};
    });

    const routed = router.function("/", route);

    type Expected = { user: string; token: string };
    type Actual = RouterCtxIn<typeof routed>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("router.function(route) yields the expected CtxOut type", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.function((i: undefined, ctx: { token: string }) => {
      return {};
    });

    const routed = router.function("/", route);

    type Expected = { password: string };
    type Actual = RouterCtxOut<typeof routed>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("router.function(route) yields the expected ResultCtx type", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.function((i: undefined, ctx: { token: string }) => {
      return {};
    });

    const routed = router.function("/", route);

    type Expected = { password: string; token: string; user: string };
    type Actual = Resolve<
      ResultCtx<RouterCtxIn<typeof routed>, RouterCtxOut<typeof routed>>
    >;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});
