import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.chdir(__dirname);

await build({
  configFile: path.resolve(__dirname, "vite.config.ts"),
  build: {
    outDir: path.resolve(__dirname, "../../dist"),
    emptyOutDir: true,
  }
});
