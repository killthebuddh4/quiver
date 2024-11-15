import quiver from "./index.js";
import { Resolve } from "./types/util/Resolve.js";
import { Equal } from "./types/test/Equal.js";
import { Expect } from "./types/test/Expect.js";
import { ResultCtx } from "./types/middleware/ResultCtx.js";
import { InCtx } from "./types/middleware/InCtx.js";
import { OutCtx } from "./types/middleware/OutCtx.js";

const q = quiver();

describe("middleware piping works as expected", () => {
  it("valid operations do not result in type errors", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { d: "hello" };
    });

    lhs.pipe(rhs);
  });

  it("invalid operations result in type errors", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { a: string; b: null }) => {
      return { d: "hello" };
    });

    // @ts-expect-error
    lhs.pipe(rhs);
  });

  it("lhs.pipe(rhs) yields the expected CtxIn type", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { d: "hello" };
    });

    const piped = lhs.pipe(rhs);

    type Actual = InCtx<typeof piped>;
    type Expected = { a: string; c: number };
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("lhs.pipe(rhs) yields the expected CtxOut type", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { d: "hello" };
    });

    const piped = lhs.pipe(rhs);

    type Expected = { b: number; d: string };
    type Actual = OutCtx<typeof piped>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("lhs.pipe(rhs) yields the expected ResultCtx type", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { d: "hello" };
    });

    const piped = lhs.pipe(rhs);

    type Expected = { a: string; b: number; c: number; d: string };
    type Actual = Resolve<ResultCtx<InCtx<typeof piped>, OutCtx<typeof piped>>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});
