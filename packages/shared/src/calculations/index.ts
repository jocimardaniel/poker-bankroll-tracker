import type {
  CashGameDetails,
  CashGameMetrics,
  TournamentDetails,
  TournamentMetrics,
  ICMCalculationInput,
  ICMCalculationResult,
  ChipChopCalculationInput,
  ChipChopCalculationResult,
  PotOddsInput,
  PotOddsResult
} from "../types/index.js";

/**
 * Calcula todas as metricas essenciais de uma sessao de Cash Game
 */
export function calculateCashGameMetrics(
  details: Pick<CashGameDetails, "smallBlind" | "bigBlind" | "initialBuyin" | "totalRebuys" | "cashoutAmount" | "tipsAndExpenses" | "handsPlayed">,
  durationMinutes: number
): CashGameMetrics {
  const initialBuyin = details.initialBuyin || 0;
  const totalRebuys = details.totalRebuys || 0;
  const tipsAndExpenses = details.tipsAndExpenses || 0;
  const cashoutAmount = details.cashoutAmount || 0;
  const bigBlind = details.bigBlind || 1;

  const totalInvested = initialBuyin + totalRebuys + tipsAndExpenses;
  const totalReturned = cashoutAmount;
  const netProfit = totalReturned - totalInvested;

  const durationHours = durationMinutes > 0 ? durationMinutes / 60 : 0;
  const hourlyRate = durationHours > 0 ? Number((netProfit / durationHours).toFixed(2)) : 0;
  const profitInBB = Number((netProfit / bigBlind).toFixed(2));
  const bbPerHour = durationHours > 0 ? Number((profitInBB / durationHours).toFixed(2)) : 0;

  const bbPer100 =
    details.handsPlayed && details.handsPlayed > 0
      ? Number(((profitInBB / details.handsPlayed) * 100).toFixed(2))
      : null;

  return {
    totalInvested,
    totalReturned,
    netProfit,
    durationMinutes,
    durationHours: Number(durationHours.toFixed(2)),
    hourlyRate,
    bbPerHour,
    bbPer100,
    profitInBB
  };
}

/**
 * Calcula todas as metricas essenciais de um Torneio (MTT / SnG)
 */
export function calculateTournamentMetrics(
  details: Pick<
    TournamentDetails,
    "buyinFee" | "entryFee" | "reentriesCount" | "reentriesCost" | "addonsAmount" | "bountyCollected" | "prizeWon" | "totalEntries" | "finalPosition" | "isItm"
  >
): TournamentMetrics {
  const buyinFee = details.buyinFee || 0;
  const entryFee = details.entryFee || 0;
  const reentriesCost = details.reentriesCost || 0;
  const addonsAmount = details.addonsAmount || 0;
  const bountyCollected = details.bountyCollected || 0;
  const prizeWon = details.prizeWon || 0;

  const totalCost = buyinFee + entryFee + reentriesCost + addonsAmount;
  const totalReturned = prizeWon + bountyCollected;
  const netProfit = totalReturned - totalCost;

  const roiPercentage =
    totalCost > 0 ? Number((((totalReturned - totalCost) / totalCost) * 100).toFixed(2)) : 0;

  const isItm = details.isItm || prizeWon > 0;

  return {
    totalCost,
    totalReturned,
    netProfit,
    roiPercentage,
    isItm,
    totalEntries: details.totalEntries ?? null,
    finalPosition: details.finalPosition ?? null
  };
}

/**
 * Malmuth-Harville Independent Chip Model (ICM)
 * Calcula a equidade teorica de cada jogador em fichas convertida para valor monetario
 */
export function calculateICM(input: ICMCalculationInput): ICMCalculationResult {
  const { stacks, payouts } = input;
  const numPlayers = stacks.length;
  const numPayouts = Math.min(payouts.length, numPlayers);
  const totalChips = stacks.reduce((acc, s) => acc + s, 0);

  if (totalChips <= 0 || numPlayers === 0) {
    return { equity: stacks.map(() => 0), percentages: stacks.map(() => 0) };
  }

  // Ordenar payouts decrescente
  const sortedPayouts = [...payouts].sort((a, b) => b - a);
  const totalPrizePool = sortedPayouts.reduce((acc, p) => acc + p, 0);

  const equity = new Array(numPlayers).fill(0);

  for (let i = 0; i < numPlayers; i++) {
    const p1 = stacks[i] / totalChips;
    equity[i] += p1 * (sortedPayouts[0] || 0);

    if (numPayouts > 1) {
      for (let j = 0; j < numPlayers; j++) {
        if (i === j) continue;
        const p2 = (stacks[i] / (totalChips - stacks[j])) * (stacks[j] / totalChips);
        equity[i] += p2 * (sortedPayouts[1] || 0);

        if (numPayouts > 2) {
          for (let k = 0; k < numPlayers; k++) {
            if (k === i || k === j) continue;
            const p3 =
              (stacks[i] / (totalChips - stacks[j] - stacks[k])) *
              (stacks[k] / (totalChips - stacks[j])) *
              (stacks[j] / totalChips);
            equity[i] += p3 * (sortedPayouts[2] || 0);

            if (numPayouts > 3) {
              for (let m = 0; m < numPlayers; m++) {
                if (m === i || m === j || m === k) continue;
                const p4 =
                  (stacks[i] / (totalChips - stacks[j] - stacks[k] - stacks[m])) *
                  (stacks[m] / (totalChips - stacks[j] - stacks[k])) *
                  (stacks[k] / (totalChips - stacks[j])) *
                  (stacks[j] / totalChips);
                equity[i] += p4 * (sortedPayouts[3] || 0);
              }
            }
          }
        }
      }
    }
  }

  const roundedEquity = equity.map((v) => Number(v.toFixed(2)));
  const percentages = roundedEquity.map((v) =>
    totalPrizePool > 0 ? Number(((v / totalPrizePool) * 100).toFixed(2)) : 0
  );

  return {
    equity: roundedEquity,
    percentages
  };
}

/**
 * Chip-Chop (Divisao Proporcional de Stacks)
 */
export function calculateChipChop(input: ChipChopCalculationInput): ChipChopCalculationResult {
  const { stacks, payouts } = input;
  const totalChips = stacks.reduce((sum, s) => sum + s, 0);
  const totalPrizePool = payouts.reduce((sum, p) => sum + p, 0);

  if (totalChips <= 0) {
    return { payouts: stacks.map(() => 0) };
  }

  const result = stacks.map((stack) =>
    Number(((stack / totalChips) * totalPrizePool).toFixed(2))
  );

  return { payouts: result };
}

/**
 * Calculo de Pot Odds e Equidade Necessaria
 */
export function calculatePotOdds(input: PotOddsInput): PotOddsResult {
  const { potSize, callAmount } = input;
  const finalPot = potSize + callAmount;

  if (finalPot <= 0 || callAmount <= 0) {
    return { potOddsPercentage: 0, ratio: "0:1", requiredEquityPercentage: 0 };
  }

  const requiredEquity = (callAmount / finalPot) * 100;
  const ratioValue = potSize / callAmount;

  return {
    potOddsPercentage: Number(requiredEquity.toFixed(2)),
    ratio: `${ratioValue.toFixed(1)}:1`,
    requiredEquityPercentage: Number(requiredEquity.toFixed(2))
  };
}
