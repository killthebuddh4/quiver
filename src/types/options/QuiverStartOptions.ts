import { QuiverProvider } from "../quiver/QuiverProvider.js";
import { QuiverProviderOptions } from "./QuiverProviderOptions.js";

export type QuiverStartOptions = {
  provider?: {
    provider?: QuiverProvider;
    options?: QuiverProviderOptions;
  };
};
