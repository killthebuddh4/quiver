import { QuiverXmtp } from "./QuiverXmtp.js";
import { QuiverXmtpOptions } from "./QuiverXmtpOptions.js";

export type QuiverStartOptions = {
  provider?: {
    provider?: QuiverXmtp;
    options?: QuiverXmtpOptions;
  };
};
