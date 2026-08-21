import { describe, it, expect } from "vitest";
import {
  calculateCashGameMetrics,
  calculateTournamentMetrics,
  calculateICM,
  calculateChipChop,
  calculatePotOdds
} from "./index.js";

describe("Poker Math & Calculations", () => {
  describe("Cash Game Calculations (US03 & SRS)", () => {
    it("cenario 1: sessao lucrativa com rebuys e winrate", () => {
      // Buy-in: 1000, Rebuys: 500, Cashout: 2800, Duracao: 4h30m (270 min), Blinds: 5/10
      const metrics = calculateCashGameMetrics(
        {
          smallBlind: 5,
          bigBlind: 10,
          initialBuyin: 1000,
          totalRebuys: 500,
          cashoutAmount: 2800,
          tipsAndExpenses: 0,
          handsPlayed: 150
        },
        270
      );

      expect(metrics.totalInvested).toBe(1500);
      expect(metrics.totalReturned).toBe(2800);
      expect(metrics.netProfit).toBe(1300);
      expect(metrics.durationHours).toBe(4.5);
      expect(metrics.hourlyRate).toBe(288.89); // 1300 / 4.5 = 288.888... -> 288.89
      expect(metrics.profitInBB).toBe(130); // 1300 / 10 = 130 BB
      expect(metrics.bbPerHour).toBe(28.89); // 130 / 4.5 = 28.888... -> 28.89
      expect(metrics.bbPer100).toBe(86.67); // (130 / 150) * 100 = 86.666... -> 86.67
    });

    it("cenario 2: sessao com prejuizo total (bustout)", () => {
      // Total investido: 1000, Cashout: 0
      const metrics = calculateCashGameMetrics(
        {
          smallBlind: 5,
          bigBlind: 10,
          initialBuyin: 1000,
          totalRebuys: 0,
          cashoutAmount: 0,
          tipsAndExpenses: 0
        },
        120
      );

      expect(metrics.netProfit).toBe(-1000);
      expect(metrics.hourlyRate).toBe(-500);
      expect(metrics.profitInBB).toBe(-100);
    });
  });

  describe("Tournament Calculations (US05 - MTT/SnG)", () => {
    it("cenario 1: MTT Freezeout ITM (50 + 5, prize: 350)", () => {
      const metrics = calculateTournamentMetrics({
        buyinFee: 50,
        entryFee: 5,
        reentriesCount: 0,
        reentriesCost: 0,
        addonsAmount: 0,
        bountyCollected: 0,
        prizeWon: 350,
        totalEntries: 180,
        finalPosition: 5,
        isItm: true
      });

      expect(metrics.totalCost).toBe(55);
      expect(metrics.totalReturned).toBe(350);
      expect(metrics.netProfit).toBe(295);
      expect(metrics.isItm).toBe(true);
      expect(metrics.roiPercentage).toBe(536.36); // (295 / 55) * 100 = 536.3636%
    });

    it("cenario 2: MTT Freezeout Bustout (100 + 10, prize: 0)", () => {
      const metrics = calculateTournamentMetrics({
        buyinFee: 100,
        entryFee: 10,
        reentriesCount: 0,
        reentriesCost: 0,
        addonsAmount: 0,
        bountyCollected: 0,
        prizeWon: 0,
        totalEntries: 120,
        finalPosition: 45,
        isItm: false
      });

      expect(metrics.totalCost).toBe(110);
      expect(metrics.netProfit).toBe(-110);
      expect(metrics.isItm).toBe(false);
      expect(metrics.roiPercentage).toBe(-100);
    });

    it("cenario 3: Rebuy + Add-on ITM com Deal (50+5, 2 rebuys de 50, 1 addon de 50, prize 1200)", () => {
      const metrics = calculateTournamentMetrics({
        buyinFee: 50,
        entryFee: 5,
        reentriesCount: 2,
        reentriesCost: 100,
        addonsAmount: 50,
        bountyCollected: 0,
        prizeWon: 1200,
        totalEntries: 90,
        finalPosition: 2,
        isItm: true
      });

      expect(metrics.totalCost).toBe(205);
      expect(metrics.totalReturned).toBe(1200);
      expect(metrics.netProfit).toBe(995);
      expect(metrics.roiPercentage).toBe(485.37); // (995 / 205) * 100 = 485.3658%
    });

    it("cenario 4: SnG Single Table 9-Max (20+2, 1st place 90)", () => {
      const metrics = calculateTournamentMetrics({
        buyinFee: 20,
        entryFee: 2,
        reentriesCount: 0,
        reentriesCost: 0,
        addonsAmount: 0,
        bountyCollected: 0,
        prizeWon: 90,
        totalEntries: 9,
        finalPosition: 1,
        isItm: true
      });

      expect(metrics.totalCost).toBe(22);
      expect(metrics.totalReturned).toBe(90);
      expect(metrics.netProfit).toBe(68);
      expect(metrics.roiPercentage).toBe(309.09); // (68 / 22) * 100 = 309.0909%
    });

    it("cenario 5: PKO / Bounty Tournament (100+10, 1 re-entry, bounty 150, prize 400)", () => {
      const metrics = calculateTournamentMetrics({
        buyinFee: 100,
        entryFee: 10,
        reentriesCount: 1,
        reentriesCost: 110,
        addonsAmount: 0,
        bountyCollected: 150,
        prizeWon: 400,
        totalEntries: 250,
        finalPosition: 3,
        isItm: true
      });

      expect(metrics.totalCost).toBe(220);
      expect(metrics.totalReturned).toBe(550); // 400 + 150
      expect(metrics.netProfit).toBe(330);
      expect(metrics.roiPercentage).toBe(150.0);
    });
  });

  describe("In-Game Calculators (ICM, Chip-Chop, Pot Odds)", () => {
    it("ICM Calculation for 3 players", () => {
      const result = calculateICM({
        stacks: [5000, 3000, 2000],
        payouts: [500, 300, 200]
      });

      expect(result.equity.length).toBe(3);
      expect(result.equity[0]).toBeGreaterThan(result.equity[1]);
      expect(result.equity[1]).toBeGreaterThan(result.equity[2]);
      const totalEquity = result.equity.reduce((a, b) => a + b, 0);
      expect(Math.round(totalEquity)).toBe(1000);
    });

    it("Chip-Chop Calculation", () => {
      const result = calculateChipChop({
        stacks: [5000, 3000, 2000],
        payouts: [500, 300, 200]
      });

      expect(result.payouts).toEqual([500, 300, 200]);
    });

    it("Pot Odds Calculation", () => {
      // Pot: 100, Call: 50 -> Final pot 150, odds 50/150 = 33.33%, ratio 2.0:1
      const result = calculatePotOdds({
        potSize: 100,
        callAmount: 50
      });

      expect(result.potOddsPercentage).toBe(33.33);
      expect(result.ratio).toBe("2.0:1");
      expect(result.requiredEquityPercentage).toBe(33.33);
    });
  });
});
