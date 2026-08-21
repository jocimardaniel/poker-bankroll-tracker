import type { FastifyPluginAsync } from "fastify";
import {
  SessionCreateSchema,
  calculateCashGameMetrics,
  calculateTournamentMetrics
} from "@poker-tracker/shared";
import { prisma } from "../../shared/database.js";
import { authenticate } from "../../shared/auth.js";
import { Prisma } from "@prisma/client";

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  // Listar sessões com paginação e filtros
  fastify.get("/", async (request, reply) => {
    const query = request.query as {
      sessionType?: "CASH_GAME" | "TOURNAMENT";
      gameVariant?: any;
      locationType?: "LIVE" | "ONLINE";
      walletId?: string;
      startDate?: string;
      endDate?: string;
      limit?: string;
      offset?: string;
    };

    const where: Prisma.SessionWhereInput = {
      userId: request.user.userId
    };

    if (query.sessionType) where.sessionType = query.sessionType;
    if (query.gameVariant) where.gameVariant = query.gameVariant;
    if (query.locationType) where.locationType = query.locationType;
    if (query.walletId) where.walletId = query.walletId;
    if (query.startDate || query.endDate) {
      where.startTime = {};
      if (query.startDate) where.startTime.gte = new Date(query.startDate);
      if (query.endDate) where.startTime.lte = new Date(query.endDate);
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          cashGameDetails: true,
          tournamentDetails: true,
          wallet: { select: { id: true, name: true, currency: true } }
        },
        orderBy: { startTime: "desc" },
        take: query.limit ? Number(query.limit) : 50,
        skip: query.offset ? Number(query.offset) : 0
      }),
      prisma.session.count({ where })
    ]);

    return reply.send({
      sessions,
      total,
      limit: query.limit ? Number(query.limit) : 50,
      offset: query.offset ? Number(query.offset) : 0
    });
  });

  // Buscar detalhes de uma sessão
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const session = await prisma.session.findFirst({
      where: { id, userId: request.user.userId },
      include: {
        cashGameDetails: true,
        tournamentDetails: true,
        wallet: true
      }
    });

    if (!session) {
      return reply.status(404).send({ message: "Sessão não encontrada." });
    }

    return reply.send(session);
  });

  // Criar ou registrar sessão
  fastify.post("/", async (request, reply) => {
    const data = SessionCreateSchema.parse(request.body);

    const wallet = await prisma.wallet.findFirst({
      where: { id: data.walletId, userId: request.user.userId }
    });

    if (!wallet) {
      return reply.status(404).send({ message: "Carteira associada não encontrada." });
    }

    let calculatedProfit = 0;
    if (data.sessionType === "CASH_GAME" && data.cashGameDetails) {
      const metrics = calculateCashGameMetrics(data.cashGameDetails, data.durationMinutes);
      calculatedProfit = metrics.netProfit;
    } else if (data.sessionType === "TOURNAMENT" && data.tournamentDetails) {
      const metrics = calculateTournamentMetrics(data.tournamentDetails);
      calculatedProfit = metrics.netProfit;
    } else {
      calculatedProfit = data.netProfit;
    }

    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.session.create({
        data: {
          id: data.id,
          userId: request.user.userId,
          walletId: data.walletId,
          sessionType: data.sessionType,
          gameVariant: data.gameVariant,
          locationType: data.locationType,
          locationName: data.locationName,
          startTime: new Date(data.startTime),
          endTime: data.endTime ? new Date(data.endTime) : null,
          durationMinutes: data.durationMinutes,
          netProfit: new Prisma.Decimal(calculatedProfit),
          status: data.status,
          notes: data.notes,
          cashGameDetails: data.cashGameDetails
            ? {
                create: {
                  smallBlind: new Prisma.Decimal(data.cashGameDetails.smallBlind),
                  bigBlind: new Prisma.Decimal(data.cashGameDetails.bigBlind),
                  initialBuyin: new Prisma.Decimal(data.cashGameDetails.initialBuyin),
                  totalRebuys: new Prisma.Decimal(data.cashGameDetails.totalRebuys),
                  cashoutAmount: new Prisma.Decimal(data.cashGameDetails.cashoutAmount),
                  tipsAndExpenses: new Prisma.Decimal(data.cashGameDetails.tipsAndExpenses),
                  tableSize: data.cashGameDetails.tableSize,
                  handsPlayed: data.cashGameDetails.handsPlayed
                }
              }
            : undefined,
          tournamentDetails: data.tournamentDetails
            ? {
                create: {
                  buyinFee: new Prisma.Decimal(data.tournamentDetails.buyinFee),
                  entryFee: new Prisma.Decimal(data.tournamentDetails.entryFee),
                  reentriesCount: data.tournamentDetails.reentriesCount,
                  reentriesCost: new Prisma.Decimal(data.tournamentDetails.reentriesCost),
                  addonsAmount: new Prisma.Decimal(data.tournamentDetails.addonsAmount),
                  bountyCollected: new Prisma.Decimal(data.tournamentDetails.bountyCollected),
                  prizeWon: new Prisma.Decimal(data.tournamentDetails.prizeWon),
                  totalEntries: data.tournamentDetails.totalEntries,
                  finalPosition: data.tournamentDetails.finalPosition,
                  isItm: data.tournamentDetails.isItm,
                  tournamentFormat: data.tournamentDetails.tournamentFormat
                }
              }
            : undefined
        },
        include: {
          cashGameDetails: true,
          tournamentDetails: true
        }
      });

      // Atualiza o saldo da carteira com o lucro/prejuízo líquido se a sessão estiver concluída
      if (data.status === "COMPLETED") {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: new Prisma.Decimal(Number(wallet.balance) + calculatedProfit)
          }
        });
      }

      return created;
    });

    return reply.status(201).send(session);
  });

  // Atualizar / Encerrar sessão ativa
  fastify.put("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = SessionCreateSchema.partial().parse(request.body);

    const existing = await prisma.session.findFirst({
      where: { id, userId: request.user.userId },
      include: { cashGameDetails: true, tournamentDetails: true }
    });

    if (!existing) {
      return reply.status(404).send({ message: "Sessão não encontrada." });
    }

    let calculatedProfit = Number(existing.netProfit);
    if (data.cashGameDetails) {
      const mergedDetails = {
        smallBlind: data.cashGameDetails.smallBlind ?? Number(existing.cashGameDetails?.smallBlind || 0),
        bigBlind: data.cashGameDetails.bigBlind ?? Number(existing.cashGameDetails?.bigBlind || 1),
        initialBuyin: data.cashGameDetails.initialBuyin ?? Number(existing.cashGameDetails?.initialBuyin || 0),
        totalRebuys: data.cashGameDetails.totalRebuys ?? Number(existing.cashGameDetails?.totalRebuys || 0),
        cashoutAmount: data.cashGameDetails.cashoutAmount ?? Number(existing.cashGameDetails?.cashoutAmount || 0),
        tipsAndExpenses: data.cashGameDetails.tipsAndExpenses ?? Number(existing.cashGameDetails?.tipsAndExpenses || 0),
        handsPlayed: data.cashGameDetails.handsPlayed ?? existing.cashGameDetails?.handsPlayed
      };
      const duration = data.durationMinutes ?? existing.durationMinutes;
      calculatedProfit = calculateCashGameMetrics(mergedDetails, duration).netProfit;
    }

    const updated = await prisma.session.update({
      where: { id },
      data: {
        endTime: data.endTime ? new Date(data.endTime) : undefined,
        durationMinutes: data.durationMinutes,
        netProfit: new Prisma.Decimal(calculatedProfit),
        status: data.status,
        notes: data.notes
      },
      include: {
        cashGameDetails: true,
        tournamentDetails: true
      }
    });

    return reply.send(updated);
  });
};
