import { z } from "zod";
import { Wallet } from "@ethersproject/wallet";
import { createProcedure } from "./createProcedure.js";
import { createBrpc } from "./createBrpc.js";

const authorizedWallet = Wallet.createRandom();

const CLEANUP: Array<() => void> = [];

const add = createProcedure({
  input: z.object({
    a: z.number(),
    b: z.number(),
  }),
  auth: async () => true,
  handler: async ({ a, b }) => {
    return a + b;
  },
});

const concat = createProcedure({
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

const stealTreasure = createProcedure({
  input: z.object({
    amount: z.number(),
  }),
  output: z.string(),
  auth: async () => false,
  handler: async ({ amount }, ctx) => {
    return `${amount} stolen by ${ctx.message.senderAddress}`;
  },
});

describe("Brpc", () => {
  afterEach(() => {
    for (const cleanup of CLEANUP) {
      cleanup();
    }
  });

  it("should work", async function () {
    this.timeout(15000);

    const brpcForServer = createBrpc({});

    brpcForServer.router({
      api: { add, concat },
      topic: {
        peerAddress: "",
        context: {
          conversationId: "banyan.sh/brpc",
          metadata: {},
        },
      },
    });

    await brpcForServer.start({});

    CLEANUP.push(brpcForServer.stop);

    const brpcForClient = createBrpc({});

    const client = brpcForClient.client({
      api: { add, concat },
      topic: {
        peerAddress: brpcForServer.address,
        context: {
          conversationId: "banyan.sh/brpc",
          metadata: {},
        },
      },
    });

    await brpcForClient.start({});

    CLEANUP.push(brpcForClient.stop);

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

    const brpcForServer = createBrpc({});

    brpcForServer.router({
      api: { stealTreasure },
      topic: {
        peerAddress: "",
        context: {
          conversationId: "banyan.sh/brpc",
          metadata: {},
        },
      },
    });

    await brpcForServer.start({});

    CLEANUP.push(brpcForServer.stop);

    const brpcForClient = createBrpc({});

    const client = brpcForClient.client({
      api: { stealTreasure },
      topic: {
        peerAddress: brpcForServer.address,
        context: {
          conversationId: "banyan.sh/brpc",
          metadata: {},
        },
      },
    });

    await brpcForClient.start({});

    CLEANUP.push(brpcForClient.stop);

    const result = await client.stealTreasure({ amount: 100 });

    if (result.ok) {
      throw new Error("stealTreasure should have failed");
    }

    if (result.code !== "UNAUTHORIZED") {
      console.log("RESULT IS", result);
      throw new Error(
        "stealTreasure should have failed with UNAUTHORIZED code",
      );
    }

    console.log("RESULT IS", result);
  });

  it("should allow authorized access to private procedures", async function () {
    this.timeout(15000);

    const auth = createProcedure({
      output: z.literal("you are authorized"),
      auth: async ({ context }) => {
        return context.message.senderAddress === authorizedWallet.address;
      },
      handler: async () => {
        return "you are authorized" as const;
      },
    });

    const brpcForServer = createBrpc({});

    brpcForServer.router({
      api: { auth },
      topic: {
        peerAddress: "",
        context: {
          conversationId: "banyan.sh/brpc",
          metadata: {},
        },
      },
    });

    await brpcForServer.start({});

    CLEANUP.push(brpcForServer.stop);

    const brpcForUnauthorizedClient = createBrpc({});

    const unauthorizedClient = brpcForUnauthorizedClient.client({
      api: { auth },
      topic: {
        peerAddress: brpcForServer.address,
        context: {
          conversationId: "banyan.sh/brpc",
          metadata: {},
        },
      },
    });

    await brpcForUnauthorizedClient.start({});

    CLEANUP.push(brpcForUnauthorizedClient.stop);

    const brpcForAuthorizedClient = createBrpc({
      options: {
        wallet: authorizedWallet,
      },
    });

    const authorizedClient = brpcForAuthorizedClient.client({
      api: { auth },
      topic: {
        peerAddress: brpcForServer.address,
        context: {
          conversationId: "banyan.sh/brpc",
          metadata: {},
        },
      },
    });

    await brpcForAuthorizedClient.start({});

    CLEANUP.push(brpcForAuthorizedClient.stop);

    const unauthorizedResult = await unauthorizedClient.auth();

    if (unauthorizedResult.ok) {
      throw new Error("auth should have failed for unauthorized client");
    }

    const authorizedResult = await authorizedClient.auth();

    if (!authorizedResult.ok) {
      throw new Error("auth should have succeeded for authorized client");
    }

    if (authorizedResult.data !== "you are authorized") {
      throw new Error("auth returned wrong result");
    }

    console.log("AUTHORIZED RESULT IS", authorizedResult);
    console.log("AUTHORIZED RESULT IS", unauthorizedResult);
  });
});
