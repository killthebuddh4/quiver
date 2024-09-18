import { baseUrl } from "./baseUrl.js";
import { QuiverUrl } from "../types/QuiverUrl.js";

export const getResponseUrl = (
  serverAddress: string,
  namespace: string,
  path: string[],
): QuiverUrl => {
  return {
    ...baseUrl,
    channel: "responses",
    address: serverAddress,
    namespace,
    path,
  };
};
