import { createRouter } from "./quiver/createRouter.js";
import { createFunction } from "./quiver/createFunction.js";
import { createClient } from "./quiver/createClient.js";
import { createApp } from "./quiver/createApp.js";
import { createProvider } from "./quiver/createProvider.js";

export const q = {
  function: createFunction,
  router: createRouter,
  app: createApp,
  client: createClient,
  provider: createProvider,
};

export default q;
