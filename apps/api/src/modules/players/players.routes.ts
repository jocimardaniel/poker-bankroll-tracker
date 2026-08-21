import type { FastifyPluginAsync } from "fastify";
import { PlayerProfileSchema } from "@poker-tracker/shared";
import { prisma } from "../../shared/database.js";
import { authenticate } from "../../shared/auth.js";

export const playerRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/", async (request, reply) => {
    const query = request.query as { search?: string };
    const where: any = { userId: request.user.userId };

    if (query.search) {
      where.playerName = { contains: query.search, mode: "insensitive" };
    }

    const players = await prisma.playerProfile.findMany({
      where,
      orderBy: { updatedAt: "desc" }
    });

    return reply.send(players);
  });

  fastify.post("/", async (request, reply) => {
    const data = PlayerProfileSchema.parse(request.body);

    const player = await prisma.playerProfile.create({
      data: {
        id: data.id,
        userId: request.user.userId,
        playerName: data.playerName,
        tag: data.tag,
        colorHex: data.colorHex,
        notes: data.notes
      }
    });

    return reply.status(201).send(player);
  });

  fastify.put("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = PlayerProfileSchema.partial().parse(request.body);

    const updated = await prisma.playerProfile.update({
      where: { id },
      data
    });

    return reply.send(updated);
  });

  fastify.delete("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.playerProfile.delete({
      where: { id }
    });

    return reply.status(204).send();
  });
};
