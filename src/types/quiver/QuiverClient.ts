import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverProvider } from "./QuiverProvider.js";

export type QuiverClient<
  Server extends QuiverFunction<any, any, any> | QuiverRouter<any, any, any>,
> = {
  client: () => TypedClient<Server>;
  start: (provider?: QuiverProvider) => Promise<{ stop: () => void }>;
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
