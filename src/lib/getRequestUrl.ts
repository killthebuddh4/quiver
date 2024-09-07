const QUIVER = "quiver";
const VERSION = "0.0.1";
const CHANNEL = "requests";

export const getRequestUrl = (address: string, path: string[]) => {
  return `${QUIVER}/${VERSION}/${CHANNEL}/${address}/${path.join("/")}`;
};
