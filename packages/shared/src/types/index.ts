import type {
  GameVariant,
  SessionType,
  LocationType,
  SessionStatus,
  TableSize,
  TournamentFormat,
  WalletTransactionType,
  SyncStatus,
  Currency
} from '../constants/index.js';

export interface User {
  id: string;
  email: string;
  name: string;
  preferredCurrency: Currency;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  currency: Currency;
  balance: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  sessionId?: string | null;
  type: WalletTransactionType;
  amount: number;
  description?: string | null;
  createdAt: string;
}

export interface CashGameDetails {
  id?: string;
  sessionId?: string;
  smallBlind: number;
  bigBlind: number;
  initialBuyin: number;
  totalRebuys: number;
  cashoutAmount: number;
  tipsAndExpenses: number;
  tableSize: TableSize;
  handsPlayed?: number | null;
}

export interface TournamentDetails {
  id?: string;
  sessionId?: string;
  buyinFee: number;
  entryFee: number;
  reentriesCount: number;
  reentriesCost: number;
  addonsAmount: number;
  bountyCollected: number;
  prizeWon: number;
  totalEntries?: number | null;
  finalPosition?: number | null;
  isItm: boolean;
  tournamentFormat: TournamentFormat;
}

export interface Session {
  id: string;
  userId: string;
  walletId: string;
  sessionType: SessionType;
  gameVariant: GameVariant;
  locationType: LocationType;
  locationName: string;
  startTime: string;
  endTime?: string | null;
  durationMinutes: number;
  netProfit: number;
  status: SessionStatus;
  notes?: string | null;
  clientSyncId?: string;
  syncStatus?: SyncStatus;
  cashGameDetails?: CashGameDetails | null;
  tournamentDetails?: TournamentDetails | null;
  createdAt: string;
  updatedAt: string;
}

export interface CashGameMetrics {
  totalInvested: number;
  totalReturned: number;
  netProfit: number;
  durationMinutes: number;
  durationHours: number;
  hourlyRate: number; // $/hora
  bbPerHour: number;  // BB/hora
  bbPer100?: number | null; // bb/100
  profitInBB: number;
}

export interface TournamentMetrics {
  totalCost: number; // buyin + entryFee + reentriesCost + addonsAmount
  totalReturned: number; // prizeWon + bountyCollected
  netProfit: number;
  roiPercentage: number; // ROI% = ((totalReturned - totalCost) / totalCost) * 100
  isItm: boolean;
  totalEntries?: number | null;
  finalPosition?: number | null;
}

export interface DashboardMetrics {
  totalBankroll: number;
  totalNetProfit: number;
  cashGames: {
    totalSessions: number;
    totalHours: number;
    totalProfit: number;
    avgHourlyRate: number;
    avgBbPerHour: number;
    winratePercentage: number;
  };
  tournaments: {
    totalTournaments: number;
    totalCost: number;
    totalPrizes: number;
    totalProfit: number;
    roiPercentage: number;
    itmPercentage: number;
    avgBuyin: number;
  };
}

export interface PlayerProfile {
  id: string;
  userId: string;
  playerName: string;
  tag: string;
  colorHex: string;
  notes?: string | null;
  clientSyncId?: string;
  syncStatus?: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SyncBatchPayload {
  sessions: Session[];
  wallets: Wallet[];
  transactions: WalletTransaction[];
  players: PlayerProfile[];
  lastSyncedAt?: string | null;
}

export interface SyncBatchResult {
  syncedSessionIds: string[];
  syncedWalletIds: string[];
  syncedPlayerIds: string[];
  conflicts: Array<{ id: string; entity: string; message: string }>;
  timestamp: string;
}

export interface ICMCalculationInput {
  stacks: number[];
  payouts: number[];
}

export interface ICMCalculationResult {
  equity: number[];
  percentages: number[];
}

export interface ChipChopCalculationInput {
  stacks: number[];
  payouts: number[];
}

export interface ChipChopCalculationResult {
  payouts: number[];
}

export interface PotOddsInput {
  potSize: number;
  callAmount: number;
}

export interface PotOddsResult {
  potOddsPercentage: number;
  ratio: string;
  requiredEquityPercentage: number;
}
