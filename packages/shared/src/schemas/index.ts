import { z } from 'zod';
import {
  GameVariants,
  LocationTypes,
  SessionStatuses,
  SessionTypes,
  TableSizes,
  TournamentFormats,
  WalletTransactionTypes,
  Currencies
} from '../constants/index.js';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres').regex(/[a-zA-Z]/, 'Senha deve conter letras').regex(/[0-9]/, 'Senha deve conter números'),
  preferredCurrency: z.enum([Currencies.BRL, Currencies.USD, Currencies.EUR, Currencies.GBP]).default(Currencies.BRL)
});

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

export const WalletSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Nome da carteira deve ter no mínimo 2 caracteres'),
  currency: z.enum([Currencies.BRL, Currencies.USD, Currencies.EUR, Currencies.GBP]).default(Currencies.BRL),
  balance: z.number().default(0)
});

export const WalletTransactionSchema = z.object({
  walletId: z.string().uuid('ID de carteira inválido'),
  type: z.enum([
    WalletTransactionTypes.DEPOSIT,
    WalletTransactionTypes.WITHDRAWAL,
    WalletTransactionTypes.ADJUSTMENT
  ]),
  amount: z.number().positive('O valor deve ser maior que zero'),
  description: z.string().optional()
});

export const WalletTransferSchema = z.object({
  fromWalletId: z.string().uuid('ID da carteira de origem inválido'),
  toWalletId: z.string().uuid('ID da carteira de destino inválido'),
  amount: z.number().positive('O valor transferido deve ser maior que zero'),
  description: z.string().optional()
});

export const CashGameDetailsSchema = z.object({
  smallBlind: z.number().nonnegative('Small blind deve ser >= 0'),
  bigBlind: z.number().positive('Big blind deve ser maior que zero'),
  initialBuyin: z.number().positive('Buy-in inicial deve ser maior que zero'),
  totalRebuys: z.number().nonnegative('Rebuys devem ser >= 0').default(0),
  cashoutAmount: z.number().nonnegative('Cash-out deve ser >= 0').default(0),
  tipsAndExpenses: z.number().nonnegative('Gorjetas/despesas devem ser >= 0').default(0),
  tableSize: z.enum([
    TableSizes.HEADS_UP,
    TableSizes.SIX_MAX,
    TableSizes.EIGHT_MAX,
    TableSizes.NINE_MAX,
    TableSizes.FULL_RING
  ]).default(TableSizes.SIX_MAX),
  handsPlayed: z.number().int().nonnegative().optional().nullable()
});

export const TournamentDetailsSchema = z.object({
  buyinFee: z.number().nonnegative('Buy-in deve ser >= 0'),
  entryFee: z.number().nonnegative('Taxa deve ser >= 0').default(0),
  reentriesCount: z.number().int().nonnegative('Reentradas devem ser >= 0').default(0),
  reentriesCost: z.number().nonnegative('Custo de reentradas deve ser >= 0').default(0),
  addonsAmount: z.number().nonnegative('Add-ons devem ser >= 0').default(0),
  bountyCollected: z.number().nonnegative('Bounties coletados devem ser >= 0').default(0),
  prizeWon: z.number().nonnegative('Premiação ganha deve ser >= 0').default(0),
  totalEntries: z.number().int().positive().optional().nullable(),
  finalPosition: z.number().int().positive().optional().nullable(),
  isItm: z.boolean().default(false),
  tournamentFormat: z.enum([
    TournamentFormats.FREEZEOUT,
    TournamentFormats.REBUY_ADDON,
    TournamentFormats.PKO_BOUNTY,
    TournamentFormats.MYSTERY_BOUNTY,
    TournamentFormats.SNG_SINGLE_TABLE,
    TournamentFormats.SNG_MULTI_TABLE,
    TournamentFormats.SPIN_AND_GO
  ]).default(TournamentFormats.FREEZEOUT)
});

export const SessionCreateSchema = z.object({
  id: z.string().uuid().optional(),
  walletId: z.string().uuid('Selecione uma carteira válida'),
  sessionType: z.enum([SessionTypes.CASH_GAME, SessionTypes.TOURNAMENT]),
  gameVariant: z.enum([
    GameVariants.NLH,
    GameVariants.PLO4,
    GameVariants.PLO5,
    GameVariants.PLO6,
    GameVariants.SHORT_DECK,
    GameVariants.MIXED
  ]).default(GameVariants.NLH),
  locationType: z.enum([LocationTypes.LIVE, LocationTypes.ONLINE]),
  locationName: z.string().min(1, 'Informe o local ou site'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  durationMinutes: z.number().int().nonnegative().default(0),
  netProfit: z.number().default(0),
  status: z.enum([
    SessionStatuses.IN_PROGRESS,
    SessionStatuses.COMPLETED,
    SessionStatuses.CANCELLED
  ]).default(SessionStatuses.COMPLETED),
  notes: z.string().optional().nullable(),
  cashGameDetails: CashGameDetailsSchema.optional().nullable(),
  tournamentDetails: TournamentDetailsSchema.optional().nullable()
});

export const PlayerProfileSchema = z.object({
  id: z.string().uuid().optional(),
  playerName: z.string().min(1, 'Nome do jogador é obrigatório'),
  tag: z.string().min(1, 'Tag é obrigatória'),
  colorHex: z.string().regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, 'Cor inválida'),
  notes: z.string().optional().nullable()
});

export const ICMCalculationSchema = z.object({
  stacks: z.array(z.number().positive('Stacks devem ser maiores que zero')).min(2, 'Informe pelo menos 2 stacks'),
  payouts: z.array(z.number().positive('Premiações devem ser maiores que zero')).min(2, 'Informe pelo menos 2 premiações')
});

export const ChipChopCalculationSchema = z.object({
  stacks: z.array(z.number().positive('Stacks devem ser maiores que zero')).min(2, 'Informe pelo menos 2 stacks'),
  payouts: z.array(z.number().positive('Premiações devem ser maiores que zero')).min(2, 'Informe pelo menos 2 premiações')
});

export const PotOddsSchema = z.object({
  potSize: z.number().positive('Tamanho do pote deve ser positivo'),
  callAmount: z.number().positive('Valor do call deve ser positivo')
});
