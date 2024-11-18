import { Expect } from "./types/test/Expect.js";
import { QuiverMiddleware } from "./types/QuiverMiddleware.js";
import { Equal } from "./types/test/Equal.js";
import { ResultCtx } from "./types/middleware/ResultCtx.js";
import { ComplementCtx } from "./types/middleware/ComplementCtx.js";
import { PipeableCtx } from "./types/middleware/PipeableCtx.js";
import { DisjointCtx } from "./types/middleware/DisjointCtx.js";
import { SatisfiableCtx } from "./types/middleware/SatisfiableCtx.js";
import { PipedCtxIn } from "./types/middleware/PipedCtxIn.js";
import { PipedCtxOut } from "./types/middleware/PipedCtxOut.js";
import { Resolve } from "./types/util/Resolve.js";
import { QuiverUrl } from "./types/QuiverUrl.js";
import { RootCtx } from "./types/middleware/RootCtx.js";

describe("ComplementCtx works as expected", () => {
  it("works when the complement is non-empty", () => {
    type U = { a: string; b: string };
    type S = { b: string };
    type Expected = { a: string };
    type Actual = Resolve<ComplementCtx<U, S>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the complement is empty", () => {
    type U = { a: string; b: string };
    type S = { a: string; b: string };
    type Expected = {};
    type Actual = Resolve<ComplementCtx<U, S>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when the subset is empty", () => {
    type U = { a: string };
    type S = undefined;
    type Expected = { a: string };
    type Actual = Resolve<ComplementCtx<U, S>>;
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

describe("SatisfiableCtx works as expected", () => {
  it("works when the contexts are disjoint", () => {
    type A = { a: number };
    type B = { b: string };
    type Expected = 1;
    type Actual = Resolve<SatisfiableCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when they contexts are not disjoint and are satisfiable", () => {
    type A = { a: number };
    type B = { a: 10 };
    type Expected = 1;
    type Actual = Resolve<SatisfiableCtx<A, B>>;
    type Test = Expect<Equal<Actual, Expected>>;
  });

  it("works when they contexts are not disjoint and are not satisfiable", () => {
    type A = { a: number };
    type B = { a: string };
    type Expected = 2;
    type Actual = Resolve<SatisfiableCtx<A, B>>;
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
