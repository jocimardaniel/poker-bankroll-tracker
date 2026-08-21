import { build } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(path.resolve(__dirname, "apps/web"));

await build({
  configFile: path.resolve(__dirname, "apps/web/vite.config.ts"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  }
});
