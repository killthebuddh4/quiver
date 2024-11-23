import { Expect } from "./types/test/Expect.js";
import { Equal } from "./types/test/Equal.js";
import { ResultCtx } from "./types/middleware/ResultCtx.js";
import { RemainderCtx } from "./types/middleware/RemainderCtx.js";
import { PipeableCtx } from "./types/middleware/PipeableCtx.js";
import { DisjointCtx } from "./types/middleware/DisjointCtx.js";
import { ExtendableCtx } from "./types/middleware/ExtendableCtx.js";
import { PipedCtxIn } from "./types/middleware/PipedCtxIn.js";
import { PipedCtxOut } from "./types/middleware/PipedCtxOut.js";
import { ExtendedCtxIn } from "./types/middleware/ExtendedCtxIn.js";
import { Resolve } from "./types/util/Resolve.js";
import { QuiverUrl } from "./types/QuiverUrl.js";
import { RootCtx } from "./types/middleware/RootCtx.js";
import { ComposedCtx } from "./types/middleware/ComposedCtx.js";
import { ExtendedCtxOut } from "./types/middleware/ExtendedCtxOut.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { DeriveableFn } from "./types/middleware/DeriveableFn.js";

describe("DeriveableFn works as expected", () => {
  it("yeilds the 0 parameter Fn type", () => {
    type Mw = QuiverMiddleware<undefined, undefined, any, any>;
    type Fn = () => any;
    type Expected = Fn;
    type Actual = DeriveableFn<Mw, Fn>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("yields the 1 parameter Fn type when it's compatible with the middleware", () => {
    type Mw = QuiverMiddleware<undefined, { a: string }, any, any>;
    type Fn = (i: number) => any;
    type Expected = Fn;
    type Actual = DeriveableFn<Mw, Fn>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("yields the 2 parameter Fn type when it's compatible with the middleware", () => {
    type Mw = QuiverMiddleware<undefined, { a: string }, any, any>;

    type Fn = (i: undefined, ctx: { a: string }) => any;
    type Expected = Fn;
    type Actual = DeriveableFn<Mw, Fn>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("yields never when the 2 parameter Fn type is incompatible with the middleware", () => {
    type Mw = QuiverMiddleware<undefined, { a: string }, any, any>;
    type Fn = (i: undefined, ctx: { a: number }) => any;
    type Expected = never;
    type Actual = DeriveableFn<Mw, Fn>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("RemainderCtx works as expected", () => {
  it("works when the remainder is non-empty", () => {
    type U = { a: string; b: string };
    type S = { b: string };
    type Expected = { a: string };
    type Actual = Resolve<RemainderCtx<U, S>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the remainder is empty", () => {
    type U = { a: string; b: string };
    type S = { a: string; b: string };
    type Expected = undefined;
    type Actual = Resolve<RemainderCtx<U, S>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the subset is undefined", () => {
    type U = { a: string };
    type S = undefined;
    type Expected = { a: string };
    type Actual = Resolve<RemainderCtx<U, S>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the superset is undefined", () => {
    type U = undefined;
    type S = { a: string };
    type Expected = { a: string };
    type Actual = Resolve<RemainderCtx<U, S>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("RootCtx works as expected", () => {
  it("works when the generic's dependencies are all satisfied", () => {
    type Ctx = {
      url: QuiverUrl;
    };

    type Actual = Resolve<RootCtx<Ctx>>;
    type Expected = 1;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the generic has some unsatisfied dependency", () => {
    type Ctx = {
      url: QuiverUrl;
      user: string;
    };

    type Actual = Resolve<RootCtx<Ctx>>;
    type Expected = 2;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the generic has mismatched dependencies", () => {
    type Ctx = {
      url: string;
    };

    type Actual = Resolve<RootCtx<Ctx>>;
    type Expected = 2;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("DisjointCtx works as expected", () => {
  it("works when the contexts are disjoint", () => {
    type A = { a: number };
    type B = { b: string };
    type Expected = 1;
    type Actual = Resolve<DisjointCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the contexts are not disjoint", () => {
    type A = { a: number };
    type B = { a: number };
    type Expected = 2;
    type Actual = Resolve<DisjointCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("PipeableCtx works as expected", () => {
  it("works when the contexts are disjoint", () => {
    type A = { a: number };
    type B = { b: string };
    type Expected = 1;
    type Actual = Resolve<PipeableCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the contexts overlap and are compatible", () => {
    type A = { a: number };
    type B = { a: number; b: string };
    type Expected = 1;
    type Actual = Resolve<PipeableCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the contexts overlap and are incompatible", () => {
    type A = { a: number };
    type B = { a: "a" };
    type Expected = 2;
    type Actual = Resolve<PipeableCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("ResultCtx type works as expected", () => {
  it("works when ReadsKeys and WritesKeys are disjoint", () => {
    type ReadsKeys = { a: number };
    type WritesKeys = { b: string };
    type Expected = { a: number; b: string };
    type Actual = Resolve<ResultCtx<ReadsKeys, WritesKeys>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when WritesKeys overlaps with ReadsKeys", () => {
    type ReadsKeys = { a: number; b: string };
    type WritesKeys = { b: null; c: undefined };
    type Expected = { a: number; b: null; c: undefined };
    type Actual = Resolve<ResultCtx<ReadsKeys, WritesKeys>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("ExtendableCtx works as expected", () => {
  it("works when the contexts are disjoint", () => {
    type A = { a: number };
    type B = { b: string };
    type Expected = 1;
    type Actual = Resolve<ExtendableCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when they contexts are not disjoint and are satisfiable", () => {
    type A = { a: number };
    type B = { a: 10 };
    type Expected = 1;
    type Actual = Resolve<ExtendableCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when they contexts are not disjoint and are not satisfiable", () => {
    type A = { a: number };
    type B = { a: string };
    type Expected = 2;
    type Actual = Resolve<ExtendableCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("ExtendedCtxIn works as expected", () => {
  it("works when lhs and rhs are both defined", () => {
    type LhsCtxIn = { a: number; b: string };
    type RhsCtxIn = { c: number; d: string };
    type Expected = { a: number; b: string; c: number; d: string };
    type Actual = Resolve<ExtendedCtxIn<LhsCtxIn, RhsCtxIn>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when lhs is undefined", () => {
    type LhsCtxIn = undefined;
    type RhsCtxIn = { c: number; d: string };
    type Expected = { c: number; d: string };
    type Actual = Resolve<ExtendedCtxIn<LhsCtxIn, RhsCtxIn>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when rhs is undefined", () => {
    type LhsCtxIn = { a: number; b: string };
    type RhsCtxIn = undefined;
    type Expected = { a: number; b: string };
    type Actual = Resolve<ExtendedCtxIn<LhsCtxIn, RhsCtxIn>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("ExtendedCtxOut works as expected", () => {
  it("works when lhs and rhs are both defined", () => {
    type LhsCtxOut = { a: number; b: string };
    type RhsCtxOut = { c: number; d: string };
    type Expected = { a: number; b: string; c: number; d: string };
    type Actual = Resolve<ExtendedCtxOut<LhsCtxOut, RhsCtxOut>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when lhs is undefined", () => {
    type LhsCtxOut = undefined;
    type RhsCtxOut = { c: number; d: string };
    type Expected = { c: number; d: string };
    type Actual = Resolve<ExtendedCtxOut<LhsCtxOut, RhsCtxOut>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when rhs is undefined", () => {
    type LhsCtxOut = { a: number; b: string };
    type RhsCtxOut = undefined;
    type Expected = { a: number; b: string };
    type Actual = Resolve<ExtendedCtxIn<LhsCtxOut, RhsCtxOut>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when both are undefined", () => {
    type LhsCtxOut = undefined;
    type RhsCtxOut = undefined;
    type Expected = undefined;
    type Actual = Resolve<ExtendedCtxOut<LhsCtxOut, RhsCtxOut>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("PipedCtxIn works as expected", () => {
  it("works when lhs fully satisfies rhs", () => {
    type LhsCtxIn = { a: number; b: string };
    type LhsCtxOut = { a: string };
    type RhsCtxIn = { a: string; b: string };
    type Expected = { a: number; b: string };
    type Actual = Resolve<PipedCtxIn<LhsCtxIn, LhsCtxOut, RhsCtxIn>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when lhs partially satisfies rhs", () => {
    type LhsCtxIn = { a: number; b: string };
    type LhsCtxOut = { a: string };
    type RhsCtxIn = { a: string; b: number; c: null };
    type Expected = { a: number; b: string; c: null };
    type Actual = Resolve<PipedCtxIn<LhsCtxIn, LhsCtxOut, RhsCtxIn>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("PipedCtxOut works as expected", () => {
  it("works when lhs and rhs have disjoint outputs", () => {
    type LhsCtxOut = { a: number };
    type RhsCtxOut = { b: string };
    type Expected = { a: number; b: string };
    type Actual = Resolve<PipedCtxOut<LhsCtxOut, RhsCtxOut>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when lhs and rhs have overlapping outputs", () => {
    type LhsCtxOut = { a: number; b: string };
    type RhsCtxOut = { b: object; c: null };
    type Expected = { a: number; b: object; c: null };
    type Actual = Resolve<PipedCtxOut<LhsCtxOut, RhsCtxOut>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});

describe("ComposedCtx works as expected", () => {
  it("works when the contexts are disjoint", () => {
    type A = { a: number };
    type B = { b: string };
    type Expected = { a: number; b: string };
    type Actual = Resolve<ComposedCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the contexts are not disjoint", () => {
    type A = { a: number };
    type B = { a: number };
    type Expected = { a: number };
    type Actual = Resolve<ComposedCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when lhs is undefined", () => {
    type A = undefined;
    type B = { b: string };
    type Expected = { b: string };
    type Actual = Resolve<ComposedCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when rhs is undefined", () => {
    type A = { a: number };
    type B = undefined;
    type Expected = { a: number };
    type Actual = Resolve<ComposedCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when both are undefined", () => {
    type A = undefined;
    type B = undefined;
    type Expected = undefined;
    type Actual = Resolve<ComposedCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });
});
