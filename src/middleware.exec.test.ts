import quiver from "./index.js";

describe("mw.exec(ctx) works as expected", () => {
  const q = quiver.q();

  it("works with one middleware", () => {
    const mw = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const ctx = mw.exec({ a: "hello" });

    if (ctx.b !== 1) {
      throw new Error(`Expected ctx.b to be 1, got ${ctx.b}`);
    }

    if (ctx.a !== "hello") {
      throw new Error(`Expected ctx.a to be "hello", got ${ctx.a}`);
    }
  });

  it("works with lhs.extend(rhs)", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1, c: 100 };
    });

    const rhs = q.middleware((ctx: { c: number }) => {
      return { d: "hello" };
    });

    const extended = lhs.extend(rhs);

    const ctx = extended.exec({ a: "hello", c: 2 });

    if (ctx.a !== "hello") {
      throw new Error(`Expected ctx.a to be "hello", got ${ctx.a}`);
    }

    if (ctx.b !== 1) {
      throw new Error(`Expected ctx.b to be 1, got ${ctx.b}`);
    }

    if (ctx.c !== 100) {
      throw new Error(`Expected ctx.c to be 100, got ${ctx.c}`);
    }

    if (ctx.d !== "hello") {
      throw new Error(`Expected ctx.d to be "hello", got ${ctx.d}`);
    }
  });

  it("works with lhs.pipe(rhs)", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const rhs = q.middleware((ctx: { a: string; c: number }) => {
      return { d: "hello", e: ctx.a.length + ctx.c };
    });

    const piped = lhs.pipe(rhs);

    const ctx = piped.exec({ a: "goodbye", c: 2 });

    if (ctx.a !== "goodbye") {
      throw new Error(`Expected ctx.a to be "goodbye", got ${ctx.a}`);
    }

    if (ctx.b !== 1) {
      throw new Error(`Expected ctx.b to be 1, got ${ctx.b}`);
    }

    if (ctx.c !== 2) {
      throw new Error(`Expected ctx.c to be 2, got ${ctx.c}`);
    }

    if (ctx.d !== "hello") {
      throw new Error(`Expected ctx.d to be "hello", got ${ctx.d}`);
    }

    if (ctx.e !== 9) {
      throw new Error(`Expected ctx.e to be 9, got ${ctx.e}`);
    }
  });

  it("works with a more complex pipeline", () => {
    const lhs = q.middleware((ctx: { a: string }) => {
      return { b: 1 };
    });

    const extended = lhs.extend(
      q.middleware((ctx: { c: number }) => {
        return { d: "hello" };
      }),
    );

    const rhs = q.middleware((ctx: { a: string; b: number }) => {
      return { c: ctx.a.length + ctx.b };
    });

    const piped = rhs.pipe(
      q.middleware((ctx: { f: number }) => {
        return { g: ctx.f * 2 };
      }),
    );

    const final = extended.pipe(piped);

    const ctx = final.exec({ a: "goodbye", f: 10, c: 3 });

    // after extended we should have
    // a = "goodbye"
    // b = 1
    // c = 3
    // d = "hello"

    // after piped stage 1 we should have
    // a = "goodbye"
    // b = 1
    // c = 8
    // d = hello

    // after piped stage 2 we should have
    // a = "goodbye"
    // b = 1
    // c = 8
    // d = hello
    // f = 10
    // g = 20

    if (ctx.a !== "goodbye") {
      throw new Error(`Expected ctx.a to be "goodbye", got ${ctx.a}`);
    }

    if (ctx.b !== 1) {
      throw new Error(`Expected ctx.b to be 1, got ${ctx.b}`);
    }

    if (ctx.c !== 8) {
      throw new Error(`Expected ctx.c to be 8, got ${ctx.c}`);
    }

    if (ctx.d !== "hello") {
      throw new Error(`Expected ctx.d to be "hello", got ${ctx.d}`);
    }

    if (ctx.f !== 10) {
      throw new Error(`Expected ctx.f to be 10, got ${ctx.f}`);
    }

    if (ctx.g !== 20) {
      throw new Error(`Expected ctx.g to be 20, got ${ctx.g}`);
    }
  });
});
