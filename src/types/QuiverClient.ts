import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverApp } from "./QuiverApp.js";

export type QuiverClient<App extends QuiverApp> = {
  client: () => TypedClient<App["server"]>;
  stop: () => void;
};

type TypedClient<
  Server extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
> =
  Server extends QuiverFunction<any, any, infer Exec>
    ? ReturnType<Exec> extends Promise<any>
      ? Exec
      : (...args: Parameters<Exec>) => Promise<ReturnType<Exec>>
    : Server extends QuiverRouter<any, any, any>
      ? {
          [K in keyof Server["routes"]]: TypedClient<Server["routes"][K]>;
        }
      : never;
