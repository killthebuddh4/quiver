import { defineConfig, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";

const wasmPlugin = () => ({
  name: "wasm-plugin",
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.endsWith(".wasm")) {
        res.setHeader("Content-Type", "application/wasm");
        console.log(`Set for ${req.url}`, res.getHeader("Content-Type"));
      }

      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasmPlugin()],
});
