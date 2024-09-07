import { createApp } from "./quiver/createApp.js";
import { createFunction } from "./quiver/createFunction.js";
import { createServer } from "./quiver/createServer.js";

export const q = {
  app: createApp,
  function: createFunction,
  server: createServer,
};

export default q;
