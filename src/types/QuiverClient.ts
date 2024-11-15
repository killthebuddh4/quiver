import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverClientOptions } from "./QuiverClientOptions.js";
import { QuiverResult } from "./QuiverResult.js";

export type QuiverClient<
  Server extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
> = TypedClient<Server>;

type TypedClient<
  Server extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
> =
  Server extends QuiverFunction<any, any, infer Func>
    ? Func extends (i: infer I, ctx: infer CtxIn) => infer Ret
      ? (
          ...args: [I, options?: QuiverClientOptions]
        ) => Promise<
          QuiverResult<
            Awaited<Ret extends { o: infer O; ctx: any } ? O : never>
          >
        >
      : never
    : Server extends QuiverRouter<any, any, any>
      ? {
          [K in keyof Server["routes"]]: TypedClient<Server["routes"][K]>;
        }
      : never;
