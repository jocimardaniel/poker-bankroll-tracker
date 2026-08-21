import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findVite(startDir) {
  let cur = startDir;
  while (cur !== path.dirname(cur)) {
    const candidate = path.join(cur, "node_modules", "vite");
    if (fs.existsSync(candidate)) {
      const pkgPath = path.join(candidate, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        const main = pkg.exports?.["."]?.node?.import || pkg.exports?.["."]?.import || pkg.module || pkg.main || "dist/node/index.js";
        const target = path.resolve(candidate, main);
        if (fs.existsSync(target)) return target;
      }
    }
    cur = path.dirname(cur);
  }
  return null;
}

const vitePath = findVite(__dirname) || path.resolve(__dirname, "../../node_modules/vite/dist/node/index.js");
console.log("Vite entry resolved to:", vitePath);

const { build } = await import(pathToFileURL(vitePath).href);
await build();
console.log("Build successfully completed!");
