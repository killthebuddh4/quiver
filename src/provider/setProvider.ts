import { QuiverXmtp } from "../types/QuiverXmtp.js";
import { store } from "./store.js";

export const setProvider = (provider: QuiverXmtp) => {
  if (store.get(provider.signer.address) !== undefined) {
    throw new Error(
      `Provider already exists at address ${provider.signer.address}`,
    );
  }

  store.set(provider.signer.address, provider);
};
