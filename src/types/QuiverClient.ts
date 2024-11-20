import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverClientOptions } from "./QuiverClientOptions.js";
import { QuiverResult } from "./QuiverResult.js";

export type QuiverClient<
  Server extends QuiverRouter<any, any, any> | QuiverFunction<any>,
> = TypedClient<Server>;

type TypedClient<Server> = Server extends (...args: infer Args) => infer Ret
  ? F<Server>
  : Server extends QuiverRouter<any, any, any>
    ? Server["routes"]["/"] extends (...args: any) => any
      ? F<Server["routes"]["/"]> & {
          [K in Exclude<keyof Server["routes"], "/">]: TypedClient<
            Server["routes"][K]
          >;
        }
      : {
          [K in keyof Server["routes"]]: TypedClient<Server["routes"][K]>;
        }
    : never;

type F<S> = S extends (...args: infer Args) => infer Ret
  ? Args[0] extends undefined
    ? (options?: QuiverClientOptions) => Promise<QuiverResult<Awaited<Ret>>>
    : (
        i: Args[0],
        options?: QuiverClientOptions,
      ) => Promise<QuiverResult<Awaited<Ret>>>
  : never;
