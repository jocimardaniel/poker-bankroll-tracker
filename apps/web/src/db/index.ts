import Dexie, { type Table } from "dexie";
import type { Session, Wallet, WalletTransaction, PlayerProfile } from "@poker-tracker/shared";

export interface SyncQueueItem {
  id?: number;
  entityType: "session" | "wallet" | "transaction" | "player";
  action: "create" | "update" | "delete";
  data: any;
  createdAt: string;
}

export class PokerDatabase extends Dexie {
  sessions!: Table<Session, string>;
  wallets!: Table<Wallet, string>;
  transactions!: Table<WalletTransaction, string>;
  players!: Table<PlayerProfile, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super("PokerTrackerDB");
    this.version(1).stores({
      sessions: "id, userId, walletId, sessionType, status, startTime, syncStatus, clientSyncId",
      wallets: "id, userId, name, syncStatus",
      transactions: "id, walletId, userId, sessionId, createdAt",
      players: "id, userId, playerName, tag, syncStatus",
      syncQueue: "++id, entityType, action, createdAt"
    });
  }
}

export const db = new PokerDatabase();
