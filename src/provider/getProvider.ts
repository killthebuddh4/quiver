import { store } from "./store.js";

export const getProvider = (address: string) => {
  return store.get(address);
};
