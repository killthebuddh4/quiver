import { Signer } from "./Signer.js";
import type { Client } from "@xmtp/xmtp-js";

export type QuiverOptions = {
  key?: string;
  signer?: Signer;
  xmtp?: Client;
  env?: "production" | "dev";
  hooks?: {
    disabled?: string[];
  };
};
