import { createRouter } from "./quiver/createRouter.js";
import { createFunction } from "./quiver/createFunction.js";
import { createClient } from "./quiver/createClient.js";
import { createApp } from "./quiver/createApp.js";
import { createProvider } from "./quiver/createProvider.js";
import { createMiddleware } from "./quiver/createMiddleware.js";

export const q = {
  function: createFunction,
  router: createRouter,
  client: createClient,
  app: createApp,
  provider: createProvider,
  middleware: createMiddleware,
};

export default q;
