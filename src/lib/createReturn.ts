import { Message } from "../types/Message.js";
import { Fig } from "../types/Fig.js";
import { parseQuiverPath } from "./parseQuiverPath.js";
import { QuiverContext } from "../types/QuiverContext.js";
import { QuiverRunHook } from "../types/QuiverHook.js";

export const createDispatch = (
  address: string,
  message: Message,
  hooks: {
    return: QuiverRunHook;
    throw: QuiverRunHook;
    error: QuiverRunHook;
    publish: QuiverRunHook;
  },
  publish: Fig["publish"],
) => {
  const inPath = parseQuiverPath(message);

  if (!inPath.ok) {
    throw new Error("TODO");
  }

  const outPath = `${inPath.value.quiver}/${inPath.value.version}/responses/${address}/${inPath.value.namespace}/${inPath.value.function}`;

  // if (ctx.x) return, won't work here because we know the ctx has
  // already been populated with certain fields, that's why the function
  // is called in the first place
  };
};
