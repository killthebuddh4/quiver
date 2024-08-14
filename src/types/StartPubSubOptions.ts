import { Wallet } from "@ethersproject/wallet";

export type StartPubSubOptions = {
  wallet?: Wallet;
  env?: "dev" | "production";
  onStartWithoutHandlers?: () => void;
  onCreatingXmtp?: () => void;
  onCreatedXmtp?: () => void;
  onCreateXmtpError?: (error: Error) => void;
  onStartingStream?: () => void;
  onStartedStream?: () => void;
  onStartStreamError?: (error: Error) => void;
};
