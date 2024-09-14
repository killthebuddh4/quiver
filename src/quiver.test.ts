import q from "./index.js";
import { QuiverContext } from "./types/QuiverContext.js";
import { Maybe } from "./types/util/Maybe.js";

type Root = {
  compile: (path?: string[]) => Array<(ctx: QuiverContext) => QuiverContext>;
  exec: (path?: string[]) => Maybe<(i: any, ctx: any) => any>;
};

describe("Quiver", () => {
  it("mvp works", async function () {
    this.timeout(15000);

    const app = q
      .router({})
      .function(
        "user",
        q.function((i: { user: string }) => {
          return i;
        }),
      )
      .function(
        "a",
        q.function((i: { a: string }) => i),
      )
      .function(
        "b",
        q.function((i: { b: string }) => i),
      )
      .app({
        c: q.function((i: { c: string }) => i),
        d: q.function((i: { d: string }) => i),
      });
  });
});
