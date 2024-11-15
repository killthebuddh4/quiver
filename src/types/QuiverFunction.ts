export interface QuiverFunction<
  CtxIn,
  CtxOut,
  Func extends (i: any, ctx: CtxIn) => any,
> {
  type: "QUIVER_FUNCTION";

  func: Func;
}
