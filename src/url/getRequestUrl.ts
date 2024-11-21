import { baseUrl } from "./baseUrl.js";
import { QuiverUrl } from "../types/QuiverUrl.js";

export const getRequestUrl = (
  clientAddress: string,
  path: string[],
): QuiverUrl => {
  return {
    ...baseUrl,
    channel: "requests",
    address: clientAddress,
    path,
  };
};
