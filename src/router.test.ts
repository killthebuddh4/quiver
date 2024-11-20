import quiver from "./index.js";
import { route } from "./router/route.js";

describe("routing works", () => {
  const q = quiver.q();

  after(() => {
    q.kill();
  });

  it("single layer, single route matches valid routes", function () {
    const router = q.router().function("a", () => null);

    const match = route(["a"], router);

    if (!match.success) {
      throw new Error("Expected match to be successful");
    }
  });

  it("single layer, single route does not match invalid routes", function () {
    const router = q.router().function("a", () => null);

    const match = route(["b"], router);

    if (match.success) {
      throw new Error("Expected match to be unsuccessful");
    }
  });

  it("single layer, multiple routes matches valid routes", function () {
    const router = q
      .router()
      .function("a", () => null)
      .function("b", () => null);

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
    const second = q.router().function("a", () => null);
    const first = q.router().router("second", second);

    const match = route(["second", "a"], first);

    if (!match.success) {
      console.log(match);
      throw new Error("Expected match to be successful");
    }
  });

  it("multi layer, single route does not match invalid routes", function () {
    const second = q.router().function("a", () => null);
    const first = q.router().router("second", second);

    const match = route(["second", "b"], first);

    if (match.success) {
      throw new Error("Expected match to be unsuccessful");
    }
  });

  it("root route in root layer works", function () {
    const router = q.router().function("/", () => null);

    const match = route([], router);

    if (!match.success) {
      throw new Error("Expected match to be successful");
    }
  });

  it("root route in nested layer works", function () {
    const second = q.router().function("/", () => "Hello, World!");
    const router = q.router().router("second", second);

    const match = route(["second"], router);

    if (!match.success) {
      throw new Error("Expected match to be successful");
    }
  });
});
