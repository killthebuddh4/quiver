import quiver from "./index.js";
import { QuiverResult } from "./types/QuiverResult.js";

const CLEANUP: Array<() => void> = [];

describe("end-to-end tests", () => {
  after(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });

  it("q.serve works with a manual XMTP init", async function () {
    this.timeout(10000);

    const xmtp = quiver.x();

    const backend = quiver.q({ xmtp });

    CLEANUP.push(() => backend.kill());

    backend.serve(() => "hello, world!");

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<() => "hello, world!">(xmtp.address);

    const res = (await client()) as QuiverResult<any>;

    if (!res.ok) {
      throw new Error(`Response not ok`);
    }

    if (res.data !== "hello, world!") {
      throw new Error(`Expected "hello, world!", got ${res.data}`);
    }
  });

  it("q.serve works with a function", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(() => backend.kill());

    backend.serve(() => "hello, world!");

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<() => "hello, world!">(backend.address);

    const res = (await client()) as QuiverResult<any>;

    if (!res.ok) {
      throw new Error(`Response not ok`);
    }

    if (res.data !== "hello, world!") {
      throw new Error(`Expected "hello, world!", got ${res.data}`);
    }
  });

  it("q.serve works with a middleware-created function", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(() => backend.kill());

    const f = backend
      .middleware(() => {
        return { user: "test-user" };
      })
      .function((i: undefined, ctx: { user: string }) => {
        return `hello, ${ctx.user}!`;
      });

    backend.serve(f);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<() => string>(backend.address);

    const res = (await client()) as QuiverResult<any>;

    if (!res.ok) {
      throw new Error(`Response not ok`);
    }

    if (res.data !== "hello, test-user!") {
      throw new Error(`Expected "hello, test-user!", got ${res.data}`);
    }
  });

  it("q.serve works with a function with props", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(() => backend.kill());

    backend.serve((props: { name: string }) => `hello, ${props.name}!`);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<(props: { name: string }) => string>(
      backend.address,
    );

    const res = (await client({ name: "world" })) as QuiverResult<any>;

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

    backend.serve(router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<typeof router>(backend.address);

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

    CLEANUP.push(() => backend.kill());

    const second = backend.router().function("/", () => "Hello, World!");

    const router = backend.router().router("second", second);

    backend.serve(router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<typeof router>(backend.address);

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

    backend.serve(router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<typeof router>(backend.address);

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

    backend.serve(router);

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<typeof router>(backend.address);

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

  it.only("options are passed to server", async function () {
    this.timeout(10000);

    const backend = quiver.q();

    CLEANUP.push(() => backend.kill());

    let called = false;

    backend.serve(() => 10, {
      logs: {
        onRecvMessage: () => {
          called = true;
        },
      },
    });

    const frontend = quiver.q();

    CLEANUP.push(() => frontend.kill());

    const client = frontend.client<() => number>(backend.address);

    const res = (await client()) as QuiverResult<any>;

    if (!res.ok) {
      throw new Error(`Response not ok`);
    }

    if (!called) {
      throw new Error(`Expected onRecvMessage to be called`);
    }
  });
});
