import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverClientOptions } from "./QuiverClientOptions.js";
import { QuiverResult } from "./QuiverResult.js";

export type QuiverClient<
  Server extends QuiverRouter<any, any, any> | QuiverFunction<any, any>,
> = TypedClient<Server>;

type TypedClient<
  Server extends QuiverRouter<any, any, any> | QuiverFunction<any, any>,
> =
  Server extends QuiverFunction<any, infer Func>
    ? Func extends (...args: infer Args) => infer Ret
      ? (
          ...args: [...Args, options?: QuiverClientOptions]
        ) => Promise<QuiverResult<Awaited<Ret>>>
      : never
    : Server extends QuiverRouter<any, any, any>
      ? {
          [K in keyof Server["routes"]]: TypedClient<Server["routes"][K]>;
        }
      : never;
