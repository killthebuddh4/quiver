import quiver from "./index.js";

describe("q.middleware(f) works as expected", () => {
  const q = quiver.q();

  it("q.middleware yields the correct type with a zero argument function", () => {
    const mw = q.middleware(() => {
      return {};
    });

    const next = q.middleware((ctx: { a: string }) => {
      return {};
    });
  });

  it("q.middleware yields the correct type with a one argument function", () => {
    const mw = q.middleware((ctx: { a: string }) => ({}));
  });
});
