import { QuiverUrl } from "../types/QuiverUrl.js";

export const urlToString = (url: QuiverUrl) => {
  return `${url.quiver}/${url.version}/${url.channel}/${url.address}/${url.namespace}${url.path.length > 0 ? `/${url.path.join("/")}` : ""}`;
};
