import { QuiverProvider } from "../types/QuiverProvider.js";
import { store } from "./store.js";

export const setProvider = (provider: QuiverProvider) => {
  if (store.get(provider.signer.address) !== undefined) {
    throw new Error(
      `Provider already exists at address ${provider.signer.address}`,
    );
  }

  store.set(provider.signer.address, provider);
};
