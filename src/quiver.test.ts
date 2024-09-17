import q from "./index.js";

describe("Quiver", () => {
  it.only("minimal function example", async function () {
    this.timeout(10000);

    try {
      const provider = await q.provider().start();

      const app = q.function(() => "hello world");

      const client = q.client<typeof app>({
        namespace: "quiver-test-min",
        address: provider.signer.address,
      });

      await client.start(await q.provider().start());

      await app.start("quiver-test-min", provider);

      const response = await client.client()();

      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });
  it("minimal router example", async function () {
    this.timeout(10000);

    try {
      const provider = await q.provider().start();

      const app = q.router({
        a: q.function(() => "a"),
        b: q.function(() => "b"),
        c: q.function(() => "c"),
      });

      const client = q.client<typeof app>({
        namespace: "quiver-test-min",
        address: provider.signer.address,
      });

      await client.start(await q.provider().start());

      await app.start("quiver-test-min", provider);

      const response = await client.client().a();

      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });
});
