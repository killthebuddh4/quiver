import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverClient } from "./QuiverClient.js";
import { QuiverProvider } from "./QuiverProvider.js";

export interface QuiverApi {
  middleware: <CtxIn, CtxOut>(
    exec: (ctx: CtxIn) => CtxOut,
  ) => QuiverMiddleware<CtxIn, CtxOut, never, never>;

  client: <
    Server extends QuiverFunction<any, any, any> | QuiverRouter<any, any, any>,
  >(server: {
    namespace: string;
    address: string;
  }) => QuiverClient<Server>;

  function: <Exec extends (...args: any[]) => any>(
    exec: Exec,
  ) => QuiverFunction<any, any, Exec>;

  router: <
    R extends {
      [key: string]:
        | QuiverRouter<any, any, any>
        | QuiverFunction<any, any, any>;
    },
  >(
    routes: R,
  ) => QuiverRouter<any, any, R>;

  provider: () => QuiverProvider;
}
