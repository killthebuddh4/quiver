// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import q from "./index.js";

const CLEANUP = Array<() => void>();

describe("Quiver", () => {
  it("minimal function example", async function () {
    this.timeout(15000);

    const app = q.function(() => "Hello, World!");

    CLEANUP.push(await app.start());

    const hello = q.client<typeof app>({ address: app.address });

    CLEANUP.push(() => hello.stop());

    const result = await hello.exec();

    if (result.data !== "Hello, World!") {
      throw new Error(`Expected "Hello, World!" but got ${result}`);
    }
  });

  it("minimal router example", async function () {
    this.timeout(15000);

    const app = q.router({
      hello: q.function(() => "Hello, World!"),
      goodbye: q.function(() => "Goodbye, World!"),
    });

    CLEANUP.push(await app.start());

    const client = q.client<typeof app>({ address: app.address });

    CLEANUP.push(() => hello.stop());

    const hello = await client.hello().exec();

    if (hello.data !== "Hello, World!") {
      throw new Error(`Expected "Hello, World!" but got ${result}`);
    }

    const goodbye = await client.goodbye().exec();

    if (goodbye.data !== "Goodbye, World!") {
      throw new Error(`Expected "Goodbye, World!" but got ${result}`);
    }
  });

  it("minimal middleware (no inputs) example", async function () {
    this.timeout(15000);

    const app = q
      .middleware(() => {
        return { receivedAt: new Date() };
      })
      .function((i, ctx) => {
        return ctx;
      });

    CLEANUP.push(await app.start());

    const client = q.client<typeof app>({ address: app.address });

    CLEANUP.push(() => client.stop());

    const now = new Date().getTime();

    const result = await client.exec();

    if (result.data.receivedAt - now > 1000) {
      throw new Error(`It took more than a second to get the result`);
    }
  });

  it("middleware with input constraints", async function () {
    this.timeout(15000);

    // This middleware has a type constraint on its CtxIn. So, how do we
    // guarantee that everything is wired up in a type-safe way? Where do we
    // provide initial context?

    const auth = q.middleware((ctx: { ens: { name: string } }) => {
      return {
        authed: ctx.ens.name.endsWith("my.name.eth"),
      };
    });

    CLEANUP.push(await app.start());

    const client = q.client<typeof app>({ address: app.address });

    CLEANUP.push(() => client.stop());

    const now = new Date().getTime();

    const result = await client.exec();

    if (result.data.receivedAt - now > 1000) {
      throw new Error(`It took more than a second to get the result`);
    }
  });

  it("client side context", async function () {
    this.timeout(15000);

    // TODO This is actually a case where we want to allow client-side context generation

    q.middleware((ctx: { domain: string }) => {
      return {
        authed: ctx.domain === "my.special.fancy.domain",
      };
    });

    // TODO
  });
});
