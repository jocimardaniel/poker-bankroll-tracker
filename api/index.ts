import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildApp } from "../apps/api/src/app.js";

let appPromise: any = null;

async function getFastifyApp() {
  if (!appPromise) {
    const app = buildApp();
    await app.ready();
    appPromise = app;
  }
  return appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getFastifyApp();
  app.server.emit("request", req, res);
}
