export interface QuiverFunction<
  CtxIn,
  Func extends (i: any, ctx: CtxIn) => any,
> {
  type: "QUIVER_FUNCTION";

  func: Func;
}
