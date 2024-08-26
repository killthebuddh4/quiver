export type QuiverPath = {
  quiver: "quiver";
  version: string;
  channel: "requests" | "responses";
  address: string;
  namespace: string;
  function: string;
};
