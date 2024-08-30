export type QuiverPath = {
  quiver: "quiver";
  version: string;
  channel: "requests" | "responses" | "signals";
  address: string;
  namespace: string;
  function: string;
};
