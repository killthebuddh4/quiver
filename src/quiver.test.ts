import { z } from "zod";
import { Wallet } from "@ethersproject/wallet";
import { createFunction } from "./createFunction.js";
import { createQuiver } from "./createQuiver.js";

const authorizedWallet = Wallet.createRandom();

const CLEANUP: Array<() => void> = [];

const add = createFunction({
  input: z.object({
    a: z.number(),
    b: z.number(),
  }),
  auth: async () => true,
  handler: async ({ a, b }) => {
    return a + b;
  },
});

const concat = createFunction({
  input: z.object({
    a: z.string(),
    b: z.string(),
  }),
  output: z.string(),
  auth: async () => true,
  handler: async ({ a, b }) => {
    return `${a}${b}`;
  },
});

const stealTreasure = createFunction({
  input: z.object({
    amount: z.number(),
  }),
  output: z.string(),
  auth: async () => false,
  handler: async ({ amount }, ctx) => {
    return `${amount} stolen by ${ctx.message.senderAddress}`;
  },
});

describe("Quiver", () => {
  afterEach(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });

  it("should work", async function () {
    this.timeout(15000);

    const backend = await createQuiver({});

    backend.router({ add, concat });

    await backend.start({});

    CLEANUP.push(backend.stop);

    const frontend = await createQuiver({});

    const client = frontend.client(
      { add, concat },
      { address: backend.address },
    );

    await frontend.start({});

    CLEANUP.push(frontend.stop);

    const addResult = await client.add({ a: 1, b: 2 });

    if (!addResult.ok) {
      console.error(addResult);
      throw new Error("add failed");
    }

    if (addResult.data !== 3) {
      console.error(addResult);
      throw new Error("add returned wrong result");
    }

    const concatResult = await client.concat({ a: "hello", b: "world" });

    if (!concatResult.ok) {
      throw new Error("concat failed");
    }

    if (concatResult.data !== "helloworld") {
      throw new Error("concat returned wrong result");
    }

    console.log("ADD RESULT IS", addResult.data);
    console.log("CONCAT RESULT IS", concatResult.data);
  });

  it("should not allow public access to private procedures", async function () {
    this.timeout(15000);

    const backend = await createQuiver({});

    backend.router({ stealTreasure });

    await backend.start({});

    CLEANUP.push(backend.stop);

    const frontend = await createQuiver({});

    const client = frontend.client(
      { stealTreasure },
      { address: backend.address },
    );

    await frontend.start({});

    CLEANUP.push(frontend.stop);

    const result = await client.stealTreasure({ amount: 100 });

    if (result.ok) {
      throw new Error("stealTreasure should have failed");
    }

    if (result.status !== "UNAUTHORIZED") {
      throw new Error(
        `stealTreasure should have failed with UNAUTHORIZED code, got ${result.status}`,
      );
    }

    console.log("RESULT IS", result);
  });

  it("should allow authorized access to private procedures", async function () {
    this.timeout(15000);

    const auth = createFunction({
      output: z.literal("you are authorized"),
      auth: async ({ context }) => {
        return context.message.senderAddress === authorizedWallet.address;
      },
      handler: async () => {
        return "you are authorized" as const;
      },
    });

    const backend = await createQuiver({});

    backend.router({ auth });

    await backend.start({});

    CLEANUP.push(backend.stop);

    const unauthorizedFrontend = await createQuiver({});

    const unauthorizedClient = unauthorizedFrontend.client(
      { auth },
      { address: backend.address },
    );

    await unauthorizedFrontend.start({});

    CLEANUP.push(unauthorizedFrontend.stop);

    const authorizedFrontend = await createQuiver({
      options: {
        wallet: authorizedWallet,
      },
    });

    const authorizedClient = authorizedFrontend.client(
      { auth },
      { address: backend.address },
    );

    await authorizedFrontend.start({});

    CLEANUP.push(authorizedFrontend.stop);

    const unauthorizedResult = await unauthorizedClient.auth();

    if (unauthorizedResult.ok) {
      console.error(unauthorizedResult);
      throw new Error("auth should have failed for unauthorized client");
    }

    const authorizedResult = await authorizedClient.auth();

    if (!authorizedResult.ok) {
      console.error(authorizedResult);
      throw new Error("auth should have succeeded for authorized client");
    }

    if (authorizedResult.data !== "you are authorized") {
      throw new Error("auth returned wrong result");
    }

    console.log("AUTHORIZED RESULT IS", authorizedResult);
    console.log("AUTHORIZED RESULT IS", unauthorizedResult);
  });
});
