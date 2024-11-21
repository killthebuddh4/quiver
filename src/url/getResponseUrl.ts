import { baseUrl } from "./baseUrl.js";
import { QuiverUrl } from "../types/QuiverUrl.js";

export const getResponseUrl = (
  serverAddress: string,
  path: string[],
): QuiverUrl => {
  return {
    ...baseUrl,
    channel: "responses",
    address: serverAddress,
    path,
  };
};
