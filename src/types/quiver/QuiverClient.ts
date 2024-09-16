import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverApp } from "./QuiverApp.js";

export type QuiverClient<App extends QuiverApp<any>> =
  App["server"] extends QuiverFunction<any, any, infer Exec>
    ? () => ReturnType<Exec> extends Promise<any>
        ? Exec
        : (...args: Parameters<Exec>) => Promise<ReturnType<Exec>>
    : RecursiveQuiverClient<App["server"]>;

type RecursiveQuiverClient<
  Server extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
> =
  Server extends QuiverFunction<any, any, infer Exec>
    ? // Return a function so we can pass options on a per-request basis
      ReturnType<Exec> extends Promise<any>
      ? Exec
      : (...args: Parameters<Exec>) => Promise<ReturnType<Exec>>
    : Server extends QuiverRouter<any, any, any>
      ? {
          [K in keyof Server["routes"]]: () => RecursiveQuiverClient<
            Server["routes"][K]
          >;
        }
      : never;
