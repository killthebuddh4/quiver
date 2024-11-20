import quiver from "./index.js";
import { ResultCtx } from "./types/middleware/ResultCtx.js";
import { Equal } from "./types/test/Equal.js";
import { Expect } from "./types/test/Expect.js";
import { RouterCtxIn } from "./types/router/RouterCtxIn.js";
import { Resolve } from "./types/util/Resolve.js";
import { RouterCtxOut } from "./types/router/RouterCtxOut.js";
import { QuiverRouter } from "./types/QuiverRouter.js";
import { RouteableFunction } from "./types/router/RouteableFunction.js";

describe("RouteableFunction works as expected", () => {
  it("yields the function type when it's valid", () => {
    type R = QuiverRouter<undefined, { a: "a" }, {}>;
    type F = (i: undefined, ctx: { a: string }) => number;
    type Routeable = RouteableFunction<R, F>;
    type Expected = F;
    type Actual = Routeable;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("yields never when it's not valid", () => {
    type R = QuiverRouter<undefined, { a: string }, {}>;
    type F = (i: undefined, ctx: { a: number }) => number;
    type Routeable = RouteableFunction<R, F>;
    type Expected = never;
    type Actual = Routeable;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

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

describe("router.function types work without middleware", () => {
  const q = quiver.q();

  const router = q.router();

  after(() => {
    q.kill();
  });

  it("valid 0 argument routes do not result in type errors", () => {
    router.function("/", () => 10);
  });

  it("valid 1 argument routes do not result in type errors", () => {
    router.function("/", (i: undefined) => 10);
  });

  it("valid 2 argument routes do not result in type errors", () => {
    router.function("/", (i: undefined, ctx: undefined) => 10);
  });

  it("invalid routes result in type errors", () => {
    // @ts-expect-error
    router.function("/", (i: undefined, ctx: { user: string }) => 10);
  });
});

describe("router.function types work with middleware", () => {
  const q = quiver.q();

  const router = q.router().middleware(
    q.middleware((ctx: { user: string }) => {
      return { password: "password" };
    }),
  );

  after(() => {
    q.kill();
  });

  it("valid 0 argument routes do not result in type errors", () => {
    router.function("/", () => 10);
  });

  it("valid 1 argument routes do not result in type errors", () => {
    router.function("/", (i: undefined) => 10);
  });

  it("valid 2 argument routes do not result in type errors", () => {
    router.function("/", (i: undefined, ctx: { password: string }) => 10);
  });

  it("invalid routes result in type errors", () => {
    // @ts-expect-error
    router.function("/", (i: undefined, ctx: { password: number }) => 10);
  });
});

describe("router.function yields the correct types", () => {
  const q = quiver.q();

  after(() => {
    q.kill();
  });

  it("router.function(route) yields the expected CtxIn type", () => {
    const router = q.router().middleware(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const routed = router.function(
      "/",
      (i: undefined, ctx: { token: string }) => {
        return {};
      },
    );

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

    const routed = router.function(
      "/",
      (i: undefined, ctx: { token: string }) => {
        return {};
      },
    );

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

    const routed = router.function(
      "/",
      (i: undefined, ctx: { token: string }) => {
        return {};
      },
    );

    type Expected = { password: string; token: string; user: string };
    type Actual = Resolve<
      ResultCtx<RouterCtxIn<typeof routed>, RouterCtxOut<typeof routed>>
    >;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});
