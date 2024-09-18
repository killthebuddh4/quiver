import q from "./index.js";

const CLEANUP: Array<() => void> = [];

describe("Quiver", () => {
  afterEach(() => {
    while (CLEANUP.length > 0) {
      CLEANUP.pop()?.();
    }
  });

  it("minimal function example", async function () {
    this.timeout(10000);

    try {
      const app = await q
        .function(() => "hello world")
        .app("quiver-test-min")
        .listen();

      const client = q.client<typeof app>({
        namespace: "quiver-test-min",
        address: app.address() as string,
      });

      const response = await client.client()();

      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });

  it("minimal router example", async function () {
    this.timeout(10000);

    try {
      const appProvider = await q.provider().start();

      CLEANUP.push(() => appProvider.stop());

      const app = await q
        .router({
          a: q.function(() => "a"),
          b: q.function(() => "b"),
          c: q.function(() => "c"),
        })
        .app("quiver-test-min")
        .listen();

      const clientProvider = await q.provider().start();

      CLEANUP.push(() => clientProvider.stop());

      const client = q.client<typeof app>({
        namespace: "quiver-test-min",
        address: appProvider.signer.address,
      });

      const response = await client.client().a();

      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });
});
