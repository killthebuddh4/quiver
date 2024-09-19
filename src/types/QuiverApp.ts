import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverProvider } from "./QuiverProvider.js";

export interface QuiverApp<
  Server extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
> {
  namespace: string;

  server: Server;

  stop: () => void;

  listen: (provider: QuiverProvider) => Promise<QuiverApp<Server>>;
}
