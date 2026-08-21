import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../shared/database.js";
import { authenticate } from "../../shared/auth.js";
import type { DashboardMetrics } from "@poker-tracker/shared";

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.get("/dashboard", async (request, reply) => {
    const userId = request.user.userId;

    const [wallets, sessions] = await Promise.all([
      prisma.wallet.findMany({ where: { userId, isArchived: false } }),
      prisma.session.findMany({
        where: { userId, status: "COMPLETED" },
        include: { cashGameDetails: true, tournamentDetails: true }
      })
    ]);

    const totalBankroll = wallets.reduce((acc, w) => acc + Number(w.balance), 0);
    const totalNetProfit = sessions.reduce((acc, s) => acc + Number(s.netProfit), 0);

    const cashSessions = sessions.filter((s) => s.sessionType === "CASH_GAME");
    const tournamentSessions = sessions.filter((s) => s.sessionType === "TOURNAMENT");

    // Cash Games aggregations
    const cashTotalHours = cashSessions.reduce((acc, s) => acc + (s.durationMinutes / 60), 0);
    const cashTotalProfit = cashSessions.reduce((acc, s) => acc + Number(s.netProfit), 0);
    const winningCashSessions = cashSessions.filter((s) => Number(s.netProfit) > 0).length;

    let totalBBProfit = 0;
    cashSessions.forEach((s) => {
      if (s.cashGameDetails && Number(s.cashGameDetails.bigBlind) > 0) {
        totalBBProfit += Number(s.netProfit) / Number(s.cashGameDetails.bigBlind);
      }
    });

    // Tournaments aggregations
    let tourneyTotalCost = 0;
    let tourneyTotalPrizes = 0;
    let tourneyTotalProfit = 0;
    let tourneyItmCount = 0;

    tournamentSessions.forEach((s) => {
      if (s.tournamentDetails) {
        const cost =
          Number(s.tournamentDetails.buyinFee) +
          Number(s.tournamentDetails.entryFee) +
          Number(s.tournamentDetails.reentriesCost) +
          Number(s.tournamentDetails.addonsAmount);
        const prizes =
          Number(s.tournamentDetails.prizeWon) + Number(s.tournamentDetails.bountyCollected);
        tourneyTotalCost += cost;
        tourneyTotalPrizes += prizes;
        tourneyTotalProfit += prizes - cost;
        if (s.tournamentDetails.isItm || Number(s.tournamentDetails.prizeWon) > 0) {
          tourneyItmCount++;
        }
      }
    });

    const response: DashboardMetrics = {
      totalBankroll: Number(totalBankroll.toFixed(2)),
      totalNetProfit: Number(totalNetProfit.toFixed(2)),
      cashGames: {
        totalSessions: cashSessions.length,
        totalHours: Number(cashTotalHours.toFixed(1)),
        totalProfit: Number(cashTotalProfit.toFixed(2)),
        avgHourlyRate: cashTotalHours > 0 ? Number((cashTotalProfit / cashTotalHours).toFixed(2)) : 0,
        avgBbPerHour: cashTotalHours > 0 ? Number((totalBBProfit / cashTotalHours).toFixed(2)) : 0,
        winratePercentage:
          cashSessions.length > 0 ? Number(((winningCashSessions / cashSessions.length) * 100).toFixed(1)) : 0
      },
      tournaments: {
        totalTournaments: tournamentSessions.length,
        totalCost: Number(tourneyTotalCost.toFixed(2)),
        totalPrizes: Number(tourneyTotalPrizes.toFixed(2)),
        totalProfit: Number(tourneyTotalProfit.toFixed(2)),
        roiPercentage:
          tourneyTotalCost > 0
            ? Number((((tourneyTotalPrizes - tourneyTotalCost) / tourneyTotalCost) * 100).toFixed(2))
            : 0,
        itmPercentage:
          tournamentSessions.length > 0
            ? Number(((tourneyItmCount / tournamentSessions.length) * 100).toFixed(1))
            : 0,
        avgBuyin:
          tournamentSessions.length > 0
            ? Number((tourneyTotalCost / tournamentSessions.length).toFixed(2))
            : 0
      }
    };

    return reply.send(response);
  });
};
