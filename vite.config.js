import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const maplibreAssets = new Map([
  ["maplibre-gl-worker.mjs", fileURLToPath(new URL("./node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url))],
  ["maplibre-gl-shared.mjs", fileURLToPath(new URL("./node_modules/maplibre-gl/dist/maplibre-gl-shared.mjs", import.meta.url))]
]);

function maplibreWorkerAssets() {
  return {
    name: "maplibre-worker-assets",
    configureServer(server) {
      server.middlewares.use("/maplibre", (request, response, next) => {
        const name = request.url?.replace(/^\//, "").split("?")[0];
        const path = maplibreAssets.get(name);
        if (!path) return next();
        response.setHeader("Content-Type", "text/javascript; charset=utf-8");
        response.end(readFileSync(path));
      });
    },
    buildStart() {
      for (const [name, path] of maplibreAssets) {
        this.emitFile({
          type: "asset",
          fileName: `maplibre/${name}`,
          source: readFileSync(path)
        });
      }
    }
  };
}

export default defineConfig({
  plugins: [maplibreWorkerAssets()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        privacy: fileURLToPath(new URL("./privacy.html", import.meta.url)),
        notFound: fileURLToPath(new URL("./404.html", import.meta.url))
      }
    }
  }
});
