import { QuiverContext } from "./quiver/QuiverContext.js";

export type QuiverServerOptions = {
  logs?: {
    onRecvMessage?: (ctx: QuiverContext) => void;
    onParsedUrl?: (ctx: QuiverContext) => void;
    onMatchedNamespace?: (ctx: QuiverContext) => void;
    onParsedJson?: (ctx: QuiverContext) => void;
    onParsedRequest?: (ctx: QuiverContext) => void;
    onMatchedFunction?: (ctx: QuiverContext) => void;
    onAppliedMiddleware?: (ctx: QuiverContext) => void;
    onAppliedFunction?: (ctx: QuiverContext) => void;
    onThrowing?: (ctx: QuiverContext) => void;
    onSentThrow?: (ctx: QuiverContext) => void;
    onReturning?: (ctx: QuiverContext) => void;
    onSentReturn?: (ctx: QuiverContext) => void;
    onExit?: (ctx: QuiverContext) => void;
  };
};
