import { baseUrl } from "./baseUrl.js";
import { QuiverUrl } from "../types/QuiverUrl.js";

export const getRequestUrl = (
  clientAddress: string,
  namespace: string,
  path: string[],
): QuiverUrl => {
  return {
    ...baseUrl,
    channel: "requests",
    address: clientAddress,
    namespace,
    path,
  };
};
