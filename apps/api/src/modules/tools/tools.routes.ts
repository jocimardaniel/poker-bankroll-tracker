import type { FastifyPluginAsync } from "fastify";
import {
  ICMCalculationSchema,
  ChipChopCalculationSchema,
  PotOddsSchema,
  calculateICM,
  calculateChipChop,
  calculatePotOdds
} from "@poker-tracker/shared";

export const toolsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/icm", async (request, reply) => {
    const data = ICMCalculationSchema.parse(request.body);
    const result = calculateICM(data);
    return reply.send(result);
  });

  fastify.post("/chip-chop", async (request, reply) => {
    const data = ChipChopCalculationSchema.parse(request.body);
    const result = calculateChipChop(data);
    return reply.send(result);
  });

  fastify.post("/pot-odds", async (request, reply) => {
    const data = PotOddsSchema.parse(request.body);
    const result = calculatePotOdds(data);
    return reply.send(result);
  });
};
