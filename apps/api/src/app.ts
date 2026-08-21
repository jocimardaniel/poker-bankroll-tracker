import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { errorHandler } from "./shared/error-handler.js";

import { authRoutes } from "./modules/auth/auth.routes.js";
import { walletRoutes } from "./modules/wallets/wallets.routes.js";
import { sessionRoutes } from "./modules/sessions/sessions.routes.js";
import { analyticsRoutes } from "./modules/analytics/analytics.routes.js";
import { playerRoutes } from "./modules/players/players.routes.js";
import { toolsRoutes } from "./modules/tools/tools.routes.js";
import { syncRoutes } from "./modules/sync/sync.routes.js";

export function buildApp() {
  const app = fastify({
    logger: process.env.NODE_ENV === "test" ? false : true
  });

  app.register(cors, {
    origin: true,
    credentials: true
  });

  app.register(jwt, {
    secret: process.env.JWT_SECRET || "poker_bankroll_secret_super_secure_key_2026"
  });

  app.register(swagger, {
    openapi: {
      info: {
        title: "Poker Bankroll & Session Tracker API",
        description: "API RESTful para gestão de bancas, sessões de cash game/torneios e analytics",
        version: "2.0.0"
      }
    }
  });

  app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  app.setErrorHandler(errorHandler);

  // Health check endpoint
  app.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Module routes
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(walletRoutes, { prefix: "/api/wallets" });
  app.register(sessionRoutes, { prefix: "/api/sessions" });
  app.register(analyticsRoutes, { prefix: "/api/analytics" });
  app.register(playerRoutes, { prefix: "/api/players" });
  app.register(toolsRoutes, { prefix: "/api/tools" });
  app.register(syncRoutes, { prefix: "/api/sync" });

  return app;
}
