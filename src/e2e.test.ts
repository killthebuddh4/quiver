import quiver from "./index.js";
import { QuiverResult } from "./types/QuiverResult.js";

const CLEANUP: Array<() => void> = [];

describe("end-to-end tests", () => {
  after(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });

  it("q.serve works with a function", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(backend.serve("test", () => "hello, world!"));

    const frontend = quiver.q();

    const client = frontend.client<() => "hello, world!">(
      "test",
      backend.address,
    );

    const res = (await client()) as QuiverResult<any>;

    if (!res.ok) {
      throw new Error(`Response not ok`);
    }

    if (res.data !== "hello, world!") {
      throw new Error(`Expected "hello, world!", got ${res.data}`);
    }
  });

  it("root handler in root works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(() => backend.kill());

    const router = backend
      .router()
      .function("/", () => "Hello, World!")
      .function("a", () => "A");

    backend.serve("test", router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<typeof router>("test", backend.address);

    const response = await client();

    if (!response.ok) {
      console.error(response);
      throw new Error("Response not ok");
    }

    if (response.data !== "Hello, World!") {
      throw new Error(`Unexpected response.data`);
    }

    const aResponse = (await client.a()) as QuiverResult<any>;

    if (!aResponse.ok) {
      console.error(aResponse);
      throw new Error("aResponse not ok");
    }
  });

  it("root handler in nested layer works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    const second = backend.router().function("/", () => "Hello, World!");

    const router = backend.router().router("second", second);

    CLEANUP.push(backend.serve("test", router));

    const frontend = quiver.q();

    const client = frontend.client<typeof router>("test", backend.address);

    const res = (await client.second()) as QuiverResult<any>;

    if (!res.ok) {
      throw new Error(`Response not ok`);
    }

    if (res.data !== "Hello, World!") {
      throw new Error(`Expected "hello, world!", got ${res.data}`);
    }
  });

  it("multiple routes works", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(() => backend.kill());

    const router = backend
      .router()
      .function("a", () => "A")
      .function("b", () => "B");

    backend.serve("test", router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<typeof router>("test", backend.address);

    const aResponse = (await client.a()) as QuiverResult<any>;

    if (!aResponse.ok) {
      console.error(aResponse);
      throw new Error("aResponse not ok");
    }

    if (aResponse.data !== "A") {
      throw new Error(`Expected "A", got ${aResponse.data}`);
    }

    const bResponse = (await client.b()) as QuiverResult<any>;

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

    const second = backend.router().function("c", () => "C");

    const router = backend
      .router()
      .function("a", () => "A")
      .function("b", () => "B")
      .router("second", second);

    backend.serve("test", router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<typeof router>("test", backend.address);

    const aResponse = (await client.a()) as QuiverResult<any>;

    if (!aResponse.ok) {
      throw new Error("aResponse not ok");
    }

    if (aResponse.data !== "A") {
      throw new Error(`Expected "A", got ${aResponse.data}`);
    }

    const bResponse = (await client.b()) as QuiverResult<any>;

    if (!bResponse.ok) {
      throw new Error("bResponse not ok");
    }

    if (bResponse.data !== "B") {
      throw new Error(`Expected "B", got ${bResponse.data}`);
    }

    const cResponse = (await client.second.c()) as QuiverResult<any>;

    if (!cResponse.ok) {
      console.error(cResponse);
      throw new Error("cResponse not ok");
    }

    if (cResponse.data !== "C") {
      throw new Error(`Expected "C", got ${cResponse.data}`);
    }
  });
});
