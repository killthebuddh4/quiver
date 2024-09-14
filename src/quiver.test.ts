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

    const user = q.middleware(() => ({ user: "user-1" }));

    const pass = q.middleware(() => ({ pass: "pass-1" }));

    const request = q.middleware((ctx: { request: string }) => ctx);

    const auth = q.middleware((ctx: { user: string; pass: string }) => {
      return {
        ...ctx,
        auth: ctx.user === "user-1" && ctx.pass === "pass-1",
      };
    });

    const mw = q
      .middleware((ctx) => ctx)
      .extend(user.compile())
      .extend(pass.compile())
      .extend(request.compile())
      .pipe(auth.compile());

    const c = q
      .middleware((ctx: { user: string }) => ctx)
      .router({
        d: q
          .middleware((ctx: { user: string }) => ctx)
          .function((i: { d: string }) => {
            return i;
          }),
      });

    const app = user.router({}).route({
      user: q.function((i: { user: string }) => {
        return i;
      }),
      a: q.function((i: { a: string }) => {
        return i;
      }),
      b: q.function((i: { b: string }) => {
        return i;
      }),
      c,
    });
  });
});
