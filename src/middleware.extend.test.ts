import q from "./index.js";
import { Resolve } from "./types/util/Resolve.js";
import { Equal } from "./types/test/Equal.js";
import { Expect } from "./types/test/Expect.js";
import { ResultCtx } from "./types/middleware/ResultCtx.js";
import { InCtx } from "./types/middleware/InCtx.js";
import { OutCtx } from "./types/middleware/OutCtx.js";

describe("middleware extending works as expected", () => {
  it("valid operations do not result in type errors", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { d: "hello" };
    });

    lhs.extend(rhs);
  });

  it("invalid input types result in type errors", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { a: number }) => {
      return { d: "hello" };
    });

    // @ts-expect-error
    lhs.extend(rhs);
  });

  it("invalid output types result in type errors", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { b: 1 };
    });

    // @ts-expect-error
    lhs.extend(rhs);
  });

  it("lhs.extend(rhs) yields the expected InCtx type when inputs are disjoint", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { d: "hello" };
    });

    const extended = lhs.extend(rhs);

    type Actual = InCtx<typeof extended>;
    type Expected = { a: string; c: number };
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("lhs.extend(rhs) yields the expected InCtx type when inputs overlap", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { a: "test"; c: number }) => {
      return { d: "hello" };
    });

    const extended = lhs.extend(rhs);

    type Actual = InCtx<typeof extended>;
    type Expected = { a: "test"; c: number };
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("lhs.extend(rhs) yields the expected OutCtx type", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { d: "hello" };
    });

    const extended = lhs.extend(rhs);

    type Actual = OutCtx<typeof extended>;
    type Expected = { b: number; d: string };
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("lhs.extend(rhs) yields the expected ResultCtx type", () => {
    const lhs = q.middleware((ctx: { a: string; b: number }) => {
      return { b: "hello" };
    });

    const rhs = q.middleware((ctx: { c: number; b: 10 }) => {
      return { a: 20, d: "hello" };
    });

    const extended = lhs.extend(rhs);

    type Expected = { a: number; b: string; c: number; d: string };
    type Actual = Resolve<
      ResultCtx<InCtx<typeof extended>, OutCtx<typeof extended>>
    >;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});
