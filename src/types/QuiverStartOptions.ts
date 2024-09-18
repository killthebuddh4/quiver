import { QuiverProvider } from "./QuiverProvider.js";
import { QuiverProviderOptions } from "./QuiverProviderOptions.js";

export type QuiverStartOptions = {
  provider?: {
    provider?: QuiverProvider;
    options?: QuiverProviderOptions;
  };
};
