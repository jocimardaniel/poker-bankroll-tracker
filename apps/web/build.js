import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let vitePath;
try {
  vitePath = require.resolve("vite");
} catch (e) {
  try {
    vitePath = require.resolve("vite", { paths: [path.resolve(__dirname, "../../")] });
  } catch (e2) {
    vitePath = path.resolve(__dirname, "../../node_modules/vite/dist/node/index.js");
  }
}

console.log("Using Vite from:", vitePath);
const { build } = await import(vitePath);
await build();
console.log("Vite build successfully completed!");
