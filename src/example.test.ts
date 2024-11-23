import quiver from "./index.js";

const CLEANUP: Array<() => void> = [];

describe.skip("example runner", () => {
  after(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });

  it("ttt works", async function () {
    this.timeout(10000);

    const q = quiver.q();

    CLEANUP.push(() => q.kill());

    const client = q.client<(props: { cell: number }) => undefined>("0x0");

    const response = await client({ cell: 0 });

    if (!response.ok) {
      console.error(response.error);
      throw new Error(`Response not ok`);
    }

    console.log(response.data);
  });
});
