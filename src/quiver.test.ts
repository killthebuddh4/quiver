import quiver from "./index.js";

describe("quiver end-to-end tests", () => {
  it("TODO root function works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    const hello = backend.function(() => {
      return "Hello, World!";
    });

    const middleware = backend.middleware(() => {
      return {};
    });

    const router = backend.router(middleware).bind("hello", hello);

    router.listen("test");

    const frontend = quiver.q();

    const client = frontend.client<typeof router>("test", backend.address);

    const response = await client.hello(undefined);

    if (!response.ok) {
      throw new Error("Response not ok");
    }

    if (response.data !== "Hello, World!") {
      throw new Error(`Expected "Hello, World!", got ${response.data}`);
    }
  });

  it("multiple routes works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    const a = backend.function(() => {
      return "A";
    });

    const b = backend.function(() => {
      return "B";
    });

    const middleware = backend.middleware(() => {
      return {};
    });

    const router = backend.router(middleware).bind("a", a).bind("b", b);

    router.listen("test");

    const frontend = quiver.q();

    const client = frontend.client<typeof router>("test", backend.address);

    const aResponse = await client.a(undefined);

    if (!aResponse.ok) {
      throw new Error("Response not ok");
    }

    if (aResponse.data !== "A") {
      throw new Error(`Expected "A", got ${aResponse.data}`);
    }

    const bResponse = await client.b(undefined);

    if (!bResponse.ok) {
      throw new Error("Response not ok");
    }

    if (bResponse.data !== "B") {
      throw new Error(`Expected "B", got ${bResponse.data}`);
    }
  });

  it("multiple layers of routes works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    const a = backend.function(() => {
      return "A";
    });

    const b = backend.function(() => {
      return "B";
    });

    const c = backend.function(() => {
      return "C";
    });

    const middleware = backend.middleware(() => {
      return {};
    });

    const second = backend.router(middleware).bind("c", c);

    const router = backend
      .router(middleware)
      .bind("a", a)
      .bind("b", b)
      .use("second", second);

    router.listen("test");

    const frontend = quiver.q();

    const client = frontend.client<typeof router>("test", backend.address);

    const aResponse = await client.a(undefined);

    if (!aResponse.ok) {
      throw new Error("aResponse not ok");
    }

    if (aResponse.data !== "A") {
      throw new Error(`Expected "A", got ${aResponse.data}`);
    }

    const bResponse = await client.b(undefined);

    if (!bResponse.ok) {
      throw new Error("bResponse not ok");
    }

    if (bResponse.data !== "B") {
      throw new Error(`Expected "B", got ${bResponse.data}`);
    }

    const cResponse = await client.second.c(undefined);

    if (!cResponse.ok) {
      console.error(cResponse);
      throw new Error("cResponse not ok");
    }

    if (cResponse.data !== "C") {
      throw new Error(`Expected "C", got ${cResponse.data}`);
    }
  });
});
