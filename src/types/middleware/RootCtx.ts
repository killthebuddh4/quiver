import { QuiverContext } from "../QuiverContext.js";

/* A root context must be less specific than QuiverContext. That is, any root
 * middleware must not depend on any values that aren't provided by the default
 * QuiverContext. */

export type RootCtx<Ctx> = QuiverContext extends Ctx ? 1 : 2;
