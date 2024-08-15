import { quiverStore } from "./quiverStore.js";

export const getQuiver = (args: { address: string }) => {
  return quiverStore[args.address];
};
