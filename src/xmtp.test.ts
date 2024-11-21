import quiver from "./index.js";
import { Wallet } from "@ethersproject/wallet";

describe("xmtp init works as expected", () => {
  const CLEANUP: Array<() => void> = [];

  after(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });

  it("works when passing a key", async function () {
    this.timeout(10000);
    const wallet = Wallet.createRandom();
    const xmtp = quiver.x({ init: { key: wallet.privateKey } });
    CLEANUP.push(() => xmtp.stop());
    await xmtp.start();
  });

  it("works when passing a signer", async function () {
    this.timeout(10000);
    const wallet = Wallet.createRandom();
    const xmtp = quiver.x({ init: { signer: wallet } });
    CLEANUP.push(() => xmtp.stop());
    await xmtp.start();
  });

  it("works when passing nothing", async function () {
    this.timeout(10000);
    const xmtp = quiver.x();
    CLEANUP.push(() => xmtp.stop());
    await xmtp.start();
  });
});
