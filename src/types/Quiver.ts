import { Publish } from "./Publish.js";
import { Subscribe } from "./Subscribe.js";
import { Start } from "./Start.js";
import { QuiverApiSpec } from "./QuiverApiSpec.js";
import { QuiverRouterOptions } from "./QuiverRouterOptions.js";
import { QuiverClient } from "./QuiverClient.js";
import { QuiverApi } from "./QuiverApi.js";

export type Quiver = {
  address: string;
  start: Start;
  stop: () => void;
  publish: Publish;
  subscribe: Subscribe;
  client: <Api extends QuiverApiSpec>(
    api: Api,
    router: { address: string; namespace?: string },
    options?: QuiverRouterOptions,
  ) => QuiverClient<typeof api>;
  router: (api: QuiverApi, options?: QuiverRouterOptions) => void;
};
