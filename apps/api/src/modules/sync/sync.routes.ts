import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../shared/database.js";
import { authenticate } from "../../shared/auth.js";
import type { SyncBatchPayload, SyncBatchResult } from "@poker-tracker/shared";

export const syncRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.post("/batch", async (request, reply) => {
    const payload = request.body as SyncBatchPayload;
    const userId = request.user.userId;

    const result: SyncBatchResult = {
      syncedSessionIds: [],
      syncedWalletIds: [],
      syncedPlayerIds: [],
      conflicts: [],
      timestamp: new Date().toISOString()
    };

    // Processa sessões offline
    if (payload.sessions && payload.sessions.length > 0) {
      for (const sess of payload.sessions) {
        try {
          const existing = await prisma.session.findFirst({
            where: {
              OR: [
                { id: sess.id },
                { clientSyncId: sess.clientSyncId || sess.id }
              ]
            }
          });

          if (!existing) {
            await prisma.session.create({
              data: {
                id: sess.id,
                userId,
                walletId: sess.walletId,
                sessionType: sess.sessionType,
                gameVariant: sess.gameVariant,
                locationType: sess.locationType,
                locationName: sess.locationName,
                startTime: new Date(sess.startTime),
                endTime: sess.endTime ? new Date(sess.endTime) : null,
                durationMinutes: sess.durationMinutes,
                netProfit: sess.netProfit,
                status: sess.status,
                notes: sess.notes,
                clientSyncId: sess.clientSyncId || sess.id
              }
            });
          }
          result.syncedSessionIds.push(sess.id);
        } catch (e: any) {
          result.conflicts.push({ id: sess.id, entity: "session", message: e.message });
        }
      }
    }

    return reply.send(result);
  });
};
