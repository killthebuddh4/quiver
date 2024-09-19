import q from "./index.js";
import { QuiverAppOptions } from "./types/QuiverAppOptions.js";
import { QuiverClientOptions } from "./types/QuiverClientOptions.js";

const CLEANUP: Array<{ stop: () => void }> = [];

describe("Quiver", () => {
  afterEach(() => {
    while (CLEANUP.length > 0) {
      CLEANUP.pop()?.stop();
    }
  });

  it("minimal function example", async function () {
    this.timeout(10000);

    const provider = await q.provider().start();
    const namespace = "quiver-test-min";
    const address = provider.address;

    CLEANUP.push(provider);

    const app = await q
      .function(() => `Hello, world!`)
      .app(namespace)
      .listen(provider);

    await (async () => {
      const provider = await q.provider().start();

      CLEANUP.push(provider);

      try {
        const client = q.client<typeof app>(provider, namespace, address);
        const response = await client();

        if (response.data !== "Hello, world!") {
          throw new Error(`Expected "Hello, world!", got ${response.data}`);
        }

        console.log(response.data);
      } catch (e) {
        console.error(e);
        throw e;
      }
    })();
  });

  it("minimal router example", async function () {
    this.timeout(10000);

    const provider = await q.provider().start();
    const namespace = "quiver-test-min";
    const address = provider.address;

    CLEANUP.push(provider);

    const app = await q
      .router({
        a: q.function(() => "a"),
        b: q.function(() => "b"),
        c: q.function(() => "c"),
      })
      .app(namespace)
      .listen(provider);

    await (async () => {
      const provider = await q.provider().start();

      CLEANUP.push(provider);

      try {
        const client = q.client<typeof app>(provider, namespace, address);
        const response = await client.a();

        if (response.data !== "a") {
          throw new Error(`Expected "a", got ${response.data}`);
        }

        console.log(response.data);
      } catch (e) {
        console.error(e);
        throw e;
      }
    })();
  });
});
