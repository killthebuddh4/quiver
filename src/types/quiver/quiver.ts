import { QuiverApi } from "./QuiverApi.js";
import { QuiverFunction } from "./QuiverFunction.js";
import { QuiverClient } from "./QuiverClient.js";
import { QuiverRouter } from "./QuiverRouter.js";
import { QuiverProvider } from "./QuiverProvider.js";
import { QuiverMiddleware } from "./QuiverMiddleware.js";
import { QuiverContext } from "./QuiverContext.js";
import { QuiverContextRequest } from "./QuiverContextRequest.js";
import { QuiverContextResponse } from "./QuiverContextResponse.js";

export type Quiver = QuiverApi;

export type Context<CtxIn, I, O> = QuiverContext<CtxIn, I, O>;

export type Function<
  CtxIn,
  CtxOut,
  Exec extends (...args: any[]) => any,
> = QuiverFunction<CtxIn, CtxOut, Exec>;

export type Client<
  Server extends QuiverFunction<any, any, any> | QuiverRouter<any, any, any>,
> = QuiverClient<Server>;

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

export type Provider = QuiverProvider;

export type Request = QuiverContextRequest;

export type Response = QuiverContextResponse;
