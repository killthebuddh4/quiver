export type QuiverSuccess<D> = {
  id: string;
  ok: true;
  status: "SUCCESS";
  data: D;
};
