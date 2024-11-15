export interface QuiverFunction<
  CtxIn,
  CtxOut,
  Func extends (
    i: any,
    ctx: CtxIn,
  ) => {
    o: any;
    ctx: CtxOut;
  },
> {
  type: "QUIVER_FUNCTION";

  func: Func;
}
