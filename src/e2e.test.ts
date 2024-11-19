import quiver from "./index.js";

const CLEANUP: Array<() => void> = [];

describe("end-to-end tests", () => {
  after(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });

  it("TODO root function works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(() => backend.kill());

    const hello = backend.function(() => {
      return "Hello, World!";
    });

    const router = backend.router().function("hello", hello);

    backend.serve("test", router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

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

    CLEANUP.push(() => backend.kill());

    const a = backend.function(() => {
      return "A";
    });

    const b = backend.function(() => {
      return "B";
    });

    const router = backend.router().function("a", a).function("b", b);

    backend.serve("test", router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<typeof router>("test", backend.address);

    const aResponse = await client.a();

    if (!aResponse.ok) {
      console.error(aResponse);
      throw new Error("aResponse not ok");
    }

    if (aResponse.data !== "A") {
      throw new Error(`Expected "A", got ${aResponse.data}`);
    }

    const bResponse = await client.b();

    if (!bResponse.ok) {
      console.error(bResponse);
      throw new Error("bResponse not ok");
    }

    if (bResponse.data !== "B") {
      throw new Error(`Expected "B", got ${bResponse.data}`);
    }
  });

  it("multiple layers of routes works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(() => backend.kill());

    const a = backend.function(() => {
      return "A";
    });

    const b = backend.function(() => {
      return "B";
    });

    const c = backend.function(() => {
      return "C";
    });

    const second = backend.router().function("c", c);

    const router = backend
      .router()
      .function("a", a)
      .function("b", b)
      .router("second", second);

    backend.serve("test", router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

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
