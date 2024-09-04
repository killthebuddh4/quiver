export type QuiverUrl = {
  quiver: "quiver";
  version: string;
  channel: "router" | "requests" | "responses" | "signals";
  address: string;
  namespace: string;
  function: string;
};
