import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const vitePath = require.resolve("vite");
console.log("Resolved vite to:", vitePath);
const { build } = await import(vitePath);
await build();
console.log("Build successfully completed!");
