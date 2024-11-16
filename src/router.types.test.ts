import quiver from "./index.js";
import { ResultCtx } from "./types/middleware/ResultCtx.js";
import { Equal } from "./types/test/Equal.js";
import { Expect } from "./types/test/Expect.js";
import { RouterCtxIn } from "./types/router/RouterCtxIn.js";
import { Resolve } from "./types/util/Resolve.js";
import { RouterCtxOut } from "./types/router/RouterCtxOut.js";

describe("router", () => {
  const q = quiver.q();

  it("valid routes do not result in type errors", () => {
    const router = q.router(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router(
      q.middleware((ctx: { password: string }) => {
        return {};
      }),
    );

    router.use("/", route);
  });

  it("invalid routes result in type errors", () => {
    const router = q.router(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router(
      q.middleware((ctx: { password: number }) => {
        return {};
      }),
    );

    // @ts-expect-error
    router.use("/", route);
  });

  it("router.use(route) yields the expected CtxIn type", () => {
    const router = q.router(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router(
      q.middleware((ctx: { token: string }) => {
        return {};
      }),
    );

    const routed = router.use("/", route);

    type Expected = { user: string; token: string };
    type Actual = RouterCtxIn<typeof routed>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("router.use(route) yields the expected CtxOut type", () => {
    const router = q.router(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router(
      q.middleware((ctx: { token: string }) => {
        return {};
      }),
    );

    const routed = router.use("/", route);

    type Expected = { password: string };
    type Actual = RouterCtxOut<typeof routed>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("router.use(route) yields the expected ResultCtx type", () => {
    const router = q.router(
      q.middleware((ctx: { user: string }) => {
        return { password: "password" };
      }),
    );

    const route = q.router(
      q.middleware((ctx: { token: string }) => {
        return {};
      }),
    );

    const routed = router.use("/", route);

    type Expected = { password: string; token: string; user: string };
    type Actual = Resolve<
      ResultCtx<RouterCtxIn<typeof routed>, RouterCtxOut<typeof routed>>
    >;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});
