export type QuiverNode<CtxIn> = {
  typeguard: (ctx: CtxIn) => never;
  compile: (...args: any[]) => any;
  exec: (...args: any[]) => any;
};
