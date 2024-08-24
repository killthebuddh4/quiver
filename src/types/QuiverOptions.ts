import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { Signer } from "./Signer.js";
import { Fig } from "./Fig.js";
import type { Client } from "@xmtp/xmtp-js";

export type QuiverOptions = {
  key?: string;
  signer?: Signer;
  xmtp?: Client;
  fig?: Fig;
  env?: "production" | "dev";
  middleware?: QuiverMiddleware[];
};
