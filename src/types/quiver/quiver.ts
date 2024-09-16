import { QuiverApi } from "./QuiverApi.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverClient } from "./QuiverClient.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverApp } from "./QuiverApp.js";
import { QuiverProvider } from "../QuiverProvider.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverContext } from "./QuiverContext.js";

export type Quiver = QuiverApi;

export type Context = QuiverContext;

export type Function<
  CtxIn,
  CtxOut,
  Exec extends (...args: any[]) => any,
> = QuiverFunction<CtxIn, CtxOut, Exec>;

export type Client<App extends QuiverApp<any>> = QuiverClient<App>;

export type Middleware<CtxIn, CtxOut, CtxExitIn, CtxExitOut> = QuiverMiddleware<
  CtxIn,
  CtxOut,
  CtxExitIn,
  CtxExitOut
>;

export type Router<
  CtxIn,
  CtxOut,
  Routes extends {
    [key: string]:
      | QuiverFunction<CtxOut, any, any>
      | QuiverRouter<CtxOut, any, any>;
  },
> = QuiverRouter<CtxIn, CtxOut, Routes>;

export type App<
  S extends QuiverRouter<any, any, any> | QuiverFunction<any, any, any>,
> = QuiverApp<S>;

export type Provider = QuiverProvider;
