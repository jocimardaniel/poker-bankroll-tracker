export const GameVariants = {
  NLH: 'NLH',
  PLO4: 'PLO4',
  PLO5: 'PLO5',
  PLO6: 'PLO6',
  SHORT_DECK: 'SHORT_DECK',
  MIXED: 'MIXED'
} as const;

export type GameVariant = (typeof GameVariants)[keyof typeof GameVariants];

export const SessionTypes = {
  CASH_GAME: 'CASH_GAME',
  TOURNAMENT: 'TOURNAMENT'
} as const;

export type SessionType = (typeof SessionTypes)[keyof typeof SessionTypes];

export const LocationTypes = {
  LIVE: 'LIVE',
  ONLINE: 'ONLINE'
} as const;

export type LocationType = (typeof LocationTypes)[keyof typeof LocationTypes];

export const SessionStatuses = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type SessionStatus = (typeof SessionStatuses)[keyof typeof SessionStatuses];

export const TableSizes = {
  HEADS_UP: 'HEADS_UP',
  SIX_MAX: 'SIX_MAX',
  EIGHT_MAX: 'EIGHT_MAX',
  NINE_MAX: 'NINE_MAX',
  FULL_RING: 'FULL_RING'
} as const;

export type TableSize = (typeof TableSizes)[keyof typeof TableSizes];

export const TournamentFormats = {
  FREEZEOUT: 'FREEZEOUT',
  REBUY_ADDON: 'REBUY_ADDON',
  PKO_BOUNTY: 'PKO_BOUNTY',
  MYSTERY_BOUNTY: 'MYSTERY_BOUNTY',
  SNG_SINGLE_TABLE: 'SNG_SINGLE_TABLE',
  SNG_MULTI_TABLE: 'SNG_MULTI_TABLE',
  SPIN_AND_GO: 'SPIN_AND_GO'
} as const;

export type TournamentFormat = (typeof TournamentFormats)[keyof typeof TournamentFormats];

export const WalletTransactionTypes = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_OUT: 'TRANSFER_OUT',
  SESSION_BUYIN: 'SESSION_BUYIN',
  SESSION_CASHOUT: 'SESSION_CASHOUT',
  ADJUSTMENT: 'ADJUSTMENT'
} as const;

export type WalletTransactionType = (typeof WalletTransactionTypes)[keyof typeof WalletTransactionTypes];

export const SyncStatuses = {
  SYNCED: 'synced',
  PENDING: 'pending',
  CONFLICT: 'conflict'
} as const;

export type SyncStatus = (typeof SyncStatuses)[keyof typeof SyncStatuses];

export const Currencies = {
  BRL: 'BRL',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP'
} as const;

export type Currency = (typeof Currencies)[keyof typeof Currencies];
