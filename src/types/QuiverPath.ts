export type QuiverPath = {
  quiver: "quiver";
  version: string;
  source: "router" | "client";
  address: string;
  namespace: string;
  function: string;
};
