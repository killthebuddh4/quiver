import { LeftOverlap } from "./LeftOverlap.js";
import { RightOverlap } from "./RightOverlap.js";

// This implements "if they overlap, then the overlapping part of the output
// extends the overlapping part of the input"

export type SerialInput<CtxOutMw, CtxInFn> =
  Extract<keyof CtxOutMw, keyof CtxInFn> extends never
    ? CtxInFn
    : LeftOverlap<CtxOutMw, CtxInFn> extends RightOverlap<CtxOutMw, CtxInFn>
      ? CtxInFn
      : never;

// const pipe = <Exec>(
//   path: NewKey<Routes>,
//   route: SerialExtension<CtxOut, Exec>,
// ) => {
//   routes[path as keyof Routes] = route as any;

//   const mw = middleware.pipe(route);

//   return createRouter<
//     Resolve<
//       Exec extends (ctx: infer I) => any
//         ? CtxIn extends undefined
//           ? Omit<I, keyof CtxOut>
//           : Omit<I, keyof CtxIn> & CtxIn
//         : never
//     >,
//     Resolve<Exec extends (ctx: any) => infer O ? O & CtxOut : never>,
//     Routes & { [key in string]: Exec }
//   >(mw, routes);
// };

// pipe: <Exec>(path: NewKey<Routes>, exec: SerialExtension<CtxOut, Exec>) =>
//   QuiverRouter<
//     Resolve<
//       Exec extends (ctx: infer I) => any
//         ? CtxIn extends undefined
//           ? Omit<I, keyof CtxOut>
//           : Omit<I, keyof CtxIn> & CtxIn
//         : never
//     >,
//     Resolve<Exec extends (ctx: any) => infer O ? O & CtxOut : never>,
//     Routes & { [key in string]: Exec }
//   >;
