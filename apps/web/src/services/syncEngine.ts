import { db } from "../db/index.js";
import { api } from "./api.js";
import type { SyncBatchPayload } from "@poker-tracker/shared";

class SyncEngine {
  private isSyncing = false;

  public init() {
    window.addEventListener("online", () => {
      console.log("🌐 Conexão restabelecida! Iniciando sincronização automática...");
      this.sync();
    });

    // Se já estiver online ao inicializar e logado, sincroniza
    if (navigator.onLine && localStorage.getItem("poker_tracker_token")) {
      this.sync();
    }
  }

  public async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;
    const token = localStorage.getItem("poker_tracker_token");
    if (!token) return;

    this.isSyncing = true;
    try {
      // 1. Puxa dados remotos da nuvem (Wallets e Sessões)
      await this.pullRemoteData();

      // 2. Envia dados locais pendentes para a nuvem
      await this.pushPendingData();
      console.log("✅ Sincronização em nuvem concluída com sucesso!");
    } catch (err) {
      console.warn("⚠️ Aviso na sincronização com a nuvem:", err);
    } finally {
      this.isSyncing = false;
    }
  }

  public async pullRemoteData(): Promise<void> {
    try {
      const [walletsRes, sessionsRes] = await Promise.all([
        api.wallets.list().catch(() => ({ wallets: [] })),
        api.sessions.list().catch(() => ({ sessions: [] }))
      ]);

      if (walletsRes.wallets && walletsRes.wallets.length > 0) {
        await db.wallets.bulkPut(
          walletsRes.wallets.map((w: any) => ({
            ...w,
            syncStatus: "SYNCED"
          }))
        );
      }

      if (sessionsRes.sessions && sessionsRes.sessions.length > 0) {
        await db.sessions.bulkPut(
          sessionsRes.sessions.map((s: any) => ({
            ...s,
            syncStatus: "SYNCED"
          }))
        );
      }
    } catch (e) {
      console.warn("Falha ao puxar dados remotos:", e);
    }
  }

  public async pushPendingData(): Promise<void> {
    const pendingSessions = await db.sessions.where("syncStatus").equals("PENDING").toArray();
    if (pendingSessions.length === 0) return;

    const payload: SyncBatchPayload = {
      sessions: pendingSessions.map((s) => ({
        id: s.id,
        walletId: s.walletId,
        sessionType: s.sessionType as any,
        gameVariant: s.gameVariant,
        locationType: s.locationType as any,
        locationName: s.locationName,
        startTime: s.startTime,
        endTime: s.endTime,
        durationMinutes: s.durationMinutes,
        netProfit: s.netProfit,
        status: s.status as any,
        notes: s.notes,
        clientSyncId: s.clientSyncId || s.id
      }))
    };

    const result = await api.sync.batch(payload);
    if (result.syncedSessionIds && result.syncedSessionIds.length > 0) {
      for (const id of result.syncedSessionIds) {
        await db.sessions.update(id, { syncStatus: "SYNCED" });
      }
    }
  }
}

export const syncEngine = new SyncEngine();
