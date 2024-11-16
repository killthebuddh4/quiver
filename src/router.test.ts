import quiver from "./index.js";
import { route } from "./router/route.js";

describe("routing works", () => {
  const q = quiver.q();

  const mw = q.middleware(() => {
    return {};
  });

  const fn = q.function(() => {
    return null;
  });

  it("single layer, single route matches valid routes", function () {
    const router = q.router(mw).bind("a", fn);

    const match = route(["a"], router);

    if (!match.success) {
      throw new Error("Expected match to be successful");
    }
  });

  it("single layer, single route does not match invalid routes", function () {
    const router = q.router(mw).bind("a", fn);

    const match = route(["b"], router);

    if (match.success) {
      throw new Error("Expected match to be unsuccessful");
    }
  });

  it("single layer, multiple routes matches valid routes", function () {
    const router = q.router(mw).bind("a", fn).bind("b", fn);

    const aMatch = route(["a"], router);

    if (!aMatch.success) {
      throw new Error("Expected match to be successful");
    }

    const bMatch = route(["b"], router);

    if (!bMatch.success) {
      throw new Error("Expected match to be successful");
    }
  });

  it("multi layer, single route matches valid routes", function () {
    const second = q.router(mw).bind("a", fn);
    const first = q.router(mw).use("second", second);

    const match = route(["second", "a"], first);

    if (!match.success) {
      console.log(match);
      throw new Error("Expected match to be successful");
    }
  });

  it("multi layer, single route does not match invalid routes", function () {
    const second = q.router(mw).bind("a", fn);
    const first = q.router(mw).use("second", second);

    const match = route(["second", "b"], first);

    if (match.success) {
      throw new Error("Expected match to be unsuccessful");
    }
  });
});
