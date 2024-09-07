import { createApp } from "./quiver/createApp.js";
import { createFunction } from "./quiver/createFunction.js";
import { createServer } from "./quiver/createServer.js";
import { createClient } from "./quiver/createClient.js";

export const q = {
  app: createApp,
  function: createFunction,
  server: createServer,
  client: createClient,
};

export default q;
