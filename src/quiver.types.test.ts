import quiver from "./index.js";
import { Expect } from "./types/test/Expect.js";
import { Equal } from "./types/test/Equal.js";
import { InCtx as FnInCtx } from "./types/function/InCtx.js";
import { InCtx as MwInCtx } from "./types/middleware/InCtx.js";
import { OutCtx as MwOutCtx } from "./types/middleware/OutCtx.js";
import { RouterCtxIn } from "./types/router/RouterCtxIn.js";
import { RouterCtxOut } from "./types/router/RouterCtxOut.js";

describe("quiver.q works as expected", () => {
  const q = quiver.q();

  after(() => {
    q.kill();
  });

  describe("q.function works as expected", () => {
    it("zero argument functions yield the expected types", () => {
      const f = q.function(() => 1);

      type Actual = FnInCtx<typeof f>;
      type Expected = undefined;
      type Test = Expect<Equal<Actual, Expected>>;
    });

    it("one argument functions yield the expected type", () => {
      const f = q.function((i: number) => i);

      type Actual = FnInCtx<typeof f>;
      type Expected = undefined;
      type Test = Expect<Equal<Actual, Expected>>;
    });

    it("two argument functions yield the expected type", () => {
      const f = q.function((i: number, ctx: { a: string }) => i);

      type Actual = FnInCtx<typeof f>;
      type Expected = { a: string };
      type Test = Expect<Equal<Actual, Expected>>;
    });
  });

  describe("q.middleware works as expected", () => {
    it("zero argument functions yield the expected types", () => {
      const m = q.middleware(() => {
        return { a: 1 };
      });

      type ActualCtxIn = MwInCtx<typeof m>;
      type ExpectedCtxIn = undefined;
      type TestCtxIn = Expect<Equal<ActualCtxIn, ExpectedCtxIn>>;

      type ActualCtxOut = MwOutCtx<typeof m>;
      type ExpectedCtxOut = { a: number };
      type TestCtxOut = Expect<Equal<ActualCtxOut, ExpectedCtxOut>>;
    });

    it("one argument functions yield the expected type", () => {
      const m = q.middleware((ctx: { a: string }) => {
        return { b: 1 };
      });

      type ActualCtxIn = MwInCtx<typeof m>;
      type ExpectedCtxIn = { a: string };
      type TestCtxIn = Expect<Equal<ActualCtxIn, ExpectedCtxIn>>;

      type ActualCtxOut = MwOutCtx<typeof m>;
      type ExpectedCtxOut = { b: number };
      type TestCtxOut = Expect<Equal<ActualCtxOut, ExpectedCtxOut>>;
    });

    it("void functions yield the expected type", () => {
      const m = q.middleware((ctx: { a: string }) => {
        // do nothing
      });

      type ActualCtxIn = MwInCtx<typeof m>;
      type ExpectedCtxIn = { a: string };
      type TestCtxIn = Expect<Equal<ActualCtxIn, ExpectedCtxIn>>;

      type ActualCtxOut = MwOutCtx<typeof m>;
      type ExpectedCtxOut = undefined;
      type TestCtxOut = Expect<Equal<ActualCtxOut, ExpectedCtxOut>>;
    });
  });

  describe("q.router works as expected", () => {
    it("yields the expected type", () => {
      const r = q.router();

      type ActualCtxIn = RouterCtxIn<typeof r>;
      type ExpectedCtxIn = undefined;
      type TestCtxIn = Expect<Equal<ActualCtxIn, ExpectedCtxIn>>;

      type ActualCtxOut = RouterCtxOut<typeof r>;
      type ExpectedCtxOut = undefined;
      type TestCtxOut = Expect<Equal<ActualCtxOut, ExpectedCtxOut>>;
    });
  });

  describe("q.client works as expected", () => {
    it("yields the expected type when you pass a router generic", () => {});

    it("yields the expected type when you pass a function generic", () => {});
  });
});
