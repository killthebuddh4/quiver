import { Quiver } from "../types/Quiver.js";
import { quiverStore } from "./quiverStore.js";

export const setQuiver = (args: { quiver: Quiver }) => {
  if (quiverStore[args.quiver.address] !== undefined) {
    throw new Error(`Quiver already exists at address ${args.quiver.address}`);
  }

  quiverStore[args.quiver.address] = args.quiver;
};
