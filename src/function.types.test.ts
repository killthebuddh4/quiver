import quiver from "./index.js";
import { QuiverFunction } from "./types/QuiverFunction.js";
import { Equal } from "./types/test/Equal.js";
import { Expect } from "./types/test/Expect.js";

describe("function types work", () => {
  const q = quiver.q();

  it("zero argument functions yield the expected type", () => {
    const f = q.function(() => 1);
  });

  it("one argument functions yield the expected type", () => {
    const f = q.function((i: number) => i);
  });

  it("two argument functions yield the expected type", () => {
    const f = q.function((i: number, ctx: { a: string }) => i);
  });
});
