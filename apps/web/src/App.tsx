import { useState, useEffect } from "react";
import { Navigation, type ActiveTab } from "./components/Navigation";
import { DashboardView } from "./features/dashboard/DashboardView";
import { LiveTrackerView } from "./features/sessions/LiveTrackerView";
import { SessionsListView } from "./features/sessions/SessionsListView";
import { NewSessionModal } from "./features/sessions/NewSessionModal";
import { WalletsView } from "./features/bankroll/WalletsView";
import { PlayersView } from "./features/players/PlayersView";
import { ToolsView } from "./features/tools/ToolsView";
import { AuthModal } from "./features/auth/AuthModal";
import { useAuthStore } from "./features/auth/useAuthStore";
import { db } from "./db/index";
import type { Session, Wallet, PlayerProfile } from "@poker-tracker/shared";

// Seed inicial caso o IndexedDB esteja vazio
const defaultWallets: Wallet[] = [
  {
    id: "wallet-live-1",
    userId: "user-default",
    name: "Club H2 Live",
    currency: "BRL",
    balance: 3500,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "wallet-ps-2",
    userId: "user-default",
    name: "PokerStars Online",
    currency: "USD",
    balance: 1250,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "wallet-gg-3",
    userId: "user-default",
    name: "GG Poker",
    currency: "USD",
    balance: 800,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultSessions: Session[] = [
  {
    id: "sess-1",
    userId: "user-default",
    walletId: "wallet-live-1",
    sessionType: "CASH_GAME",
    gameVariant: "NLH",
    locationType: "LIVE",
    locationName: "H2 Club Moema",
    startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    durationMinutes: 270,
    netProfit: 1300,
    status: "COMPLETED",
    notes: "Mesa bem agressiva, bom controle de pot.",
    cashGameDetails: {
      smallBlind: 5,
      bigBlind: 10,
      initialBuyin: 1000,
      totalRebuys: 500,
      cashoutAmount: 2800,
      tipsAndExpenses: 0,
      tableSize: "SIX_MAX"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "sess-2",
    userId: "user-default",
    walletId: "wallet-ps-2",
    sessionType: "TOURNAMENT",
    gameVariant: "NLH",
    locationType: "ONLINE",
    locationName: "PokerStars Sunday Warm-Up",
    startTime: new Date(Date.now() - 86400000 * 5).toISOString(),
    durationMinutes: 320,
    netProfit: 295,
    status: "COMPLETED",
    notes: "5º lugar no MTT Regular.",
    tournamentDetails: {
      buyinFee: 50,
      entryFee: 5,
      reentriesCount: 0,
      reentriesCost: 0,
      addonsAmount: 0,
      bountyCollected: 0,
      prizeWon: 350,
      totalEntries: 180,
      finalPosition: 5,
      isItm: true,
      tournamentFormat: "FREEZEOUT"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultPlayers: PlayerProfile[] = [
  {
    id: "pl-1",
    userId: "user-default",
    playerName: "João Silva (Mesa 4)",
    tag: "Calling Station / Passivo",
    colorHex: "#10B981",
    notes: "Paga muito pré-flop com suited connectors. Só aposta forte com o nuts.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "pl-2",
    userId: "user-default",
    playerName: "Pedro Reg",
    tag: "TAG (Tight Agressivo - Reg)",
    colorHex: "#3B82F6",
    notes: "Frequente do 5/10. 3-beta bastante no botão e defende muito o Big Blind.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auth Store
  const { user, isAuthenticated, logout } = useAuthStore();

  // States backed by IndexedDB
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize Dexie.js database
  useEffect(() => {
    async function initDB() {
      const storedWallets = await db.wallets.toArray();
      if (storedWallets.length === 0) {
        await db.wallets.bulkAdd(defaultWallets);
        await db.sessions.bulkAdd(defaultSessions);
        await db.players.bulkAdd(defaultPlayers);
        setWallets(defaultWallets);
        setSessions(defaultSessions);
        setPlayers(defaultPlayers);
      } else {
        const [wList, sList, pList] = await Promise.all([
          db.wallets.toArray(),
          db.sessions.toArray(),
          db.players.toArray()
        ]);
        setWallets(wList);
        setSessions(sList);
        setPlayers(pList);

        const inProgress = sList.find((s) => s.status === "IN_PROGRESS");
        if (inProgress) {
          setActiveSession(inProgress);
        }
      }
    }

    initDB();
  }, []);

  // Handlers para Wallets
  const handleAddWallet = async (name: string, currency: any, initialBalance: number) => {
    const newWallet: Wallet = {
      id: "wallet-" + Date.now(),
      userId: user ? user.id : "user-default",
      name,
      currency,
      balance: initialBalance,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.wallets.add(newWallet);
    setWallets((prev) => [...prev, newWallet]);
  };

  const handleTransfer = async (fromId: string, toId: string, amount: number) => {
    const fromW = wallets.find((w) => w.id === fromId);
    const toW = wallets.find((w) => w.id === toId);
    if (!fromW || !toW) return;

    const updatedFrom = { ...fromW, balance: fromW.balance - amount };
    const updatedTo = { ...toW, balance: toW.balance + amount };

    await db.wallets.put(updatedFrom);
    await db.wallets.put(updatedTo);

    setWallets((prev) =>
      prev.map((w) => (w.id === fromId ? updatedFrom : w.id === toId ? updatedTo : w))
    );
  };

  const handleDepositWithdraw = async (walletId: string, type: "DEPOSIT" | "WITHDRAWAL", amount: number) => {
    const target = wallets.find((w) => w.id === walletId);
    if (!target) return;

    const newBalance = type === "DEPOSIT" ? target.balance + amount : target.balance - amount;
    const updated = { ...target, balance: newBalance };

    await db.wallets.put(updated);
    setWallets((prev) => prev.map((w) => (w.id === walletId ? updated : w)));
  };

  // Handlers para Sessões
  const handleSaveRetroactiveSession = async (sessionData: Partial<Session>) => {
    const newSession: Session = {
      id: "sess-" + Date.now(),
      userId: user ? user.id : "user-default",
      walletId: sessionData.walletId || wallets[0]?.id || "wallet-default",
      sessionType: sessionData.sessionType || "CASH_GAME",
      gameVariant: sessionData.gameVariant || "NLH",
      locationType: sessionData.locationType || "LIVE",
      locationName: sessionData.locationName || "Live",
      startTime: sessionData.startTime || new Date().toISOString(),
      durationMinutes: sessionData.durationMinutes || 120,
      netProfit: sessionData.netProfit || 0,
      status: "COMPLETED",
      notes: sessionData.notes,
      cashGameDetails: sessionData.cashGameDetails,
      tournamentDetails: sessionData.tournamentDetails,
      clientSyncId: "sync-" + Date.now(),
      syncStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.sessions.add(newSession);
    setSessions((prev) => [newSession, ...prev]);

    // Atualiza saldo da carteira vinculada
    const wallet = wallets.find((w) => w.id === newSession.walletId);
    if (wallet) {
      const updatedWallet = { ...wallet, balance: wallet.balance + newSession.netProfit };
      await db.wallets.put(updatedWallet);
      setWallets((prev) => prev.map((w) => (w.id === wallet.id ? updatedWallet : w)));
    }

    setShowNewModal(false);
  };

  // Live Tracker Session Handlers
  const handleStartLiveSession = async (data: {
    walletId: string;
    gameVariant: any;
    locationType: any;
    locationName: string;
    smallBlind: number;
    bigBlind: number;
    initialBuyin: number;
  }) => {
    const newLive: Session = {
      id: "live-" + Date.now(),
      userId: user ? user.id : "user-default",
      walletId: data.walletId,
      sessionType: "CASH_GAME",
      gameVariant: data.gameVariant,
      locationType: data.locationType,
      locationName: data.locationName,
      startTime: new Date().toISOString(),
      durationMinutes: 0,
      netProfit: 0,
      status: "IN_PROGRESS",
      cashGameDetails: {
        smallBlind: data.smallBlind,
        bigBlind: data.bigBlind,
        initialBuyin: data.initialBuyin,
        totalRebuys: 0,
        cashoutAmount: 0,
        tipsAndExpenses: 0,
        tableSize: "SIX_MAX"
      },
      clientSyncId: "live-sync-" + Date.now(),
      syncStatus: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.sessions.add(newLive);
    setActiveSession(newLive);
    setSessions((prev) => [newLive, ...prev]);
    setActiveTab("live");
  };

  const handleAddLiveRebuy = async (amount: number) => {
    if (!activeSession || !activeSession.cashGameDetails) return;

    const currentRebuys = activeSession.cashGameDetails.totalRebuys || 0;
    const updatedDetails = {
      ...activeSession.cashGameDetails,
      totalRebuys: currentRebuys + amount
    };

    const updatedSession: Session = {
      ...activeSession,
      cashGameDetails: updatedDetails,
      updatedAt: new Date().toISOString()
    };

    await db.sessions.put(updatedSession);
    setActiveSession(updatedSession);
    setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
  };

  const handleEndLiveSession = async (cashoutAmount: number, tips: number, notes: string) => {
    if (!activeSession || !activeSession.cashGameDetails) return;

    const startTime = new Date(activeSession.startTime).getTime();
    const durationMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));

    const totalInvested =
      activeSession.cashGameDetails.initialBuyin +
      (activeSession.cashGameDetails.totalRebuys || 0) +
      tips;
    const netProfit = cashoutAmount - totalInvested;

    const completedSession: Session = {
      ...activeSession,
      status: "COMPLETED",
      endTime: new Date().toISOString(),
      durationMinutes,
      netProfit,
      notes: notes || activeSession.notes,
      cashGameDetails: {
        ...activeSession.cashGameDetails,
        cashoutAmount,
        tipsAndExpenses: tips
      },
      updatedAt: new Date().toISOString()
    };

    await db.sessions.put(completedSession);

    // Atualiza saldo da carteira
    const targetWallet = wallets.find((w) => w.id === completedSession.walletId);
    if (targetWallet) {
      const updatedWallet = { ...targetWallet, balance: targetWallet.balance + netProfit };
      await db.wallets.put(updatedWallet);
      setWallets((prev) => prev.map((w) => (w.id === targetWallet.id ? updatedWallet : w)));
    }

    setActiveSession(null);
    setSessions((prev) => prev.map((s) => (s.id === completedSession.id ? completedSession : s)));
    setActiveTab("dashboard");
  };

  // Players profiling handlers
  const handleAddPlayer = async (playerName: string, tag: string, colorHex: string, notes: string) => {
    const newPlayer: PlayerProfile = {
      id: "pl-" + Date.now(),
      userId: user ? user.id : "user-default",
      playerName,
      tag,
      colorHex,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.players.add(newPlayer);
    setPlayers((prev) => [newPlayer, ...prev]);
  };

  const handleDeletePlayer = async (id: string) => {
    await db.players.delete(id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-poker-bg text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSessionClick={() => setShowNewModal(true)}
        isOnline={isOnline}
        user={user}
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onLogout={logout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === "dashboard" && (
          <DashboardView
            sessions={sessions}
            wallets={wallets}
            onStartLiveSession={() => setActiveTab("live")}
            onNewSessionClick={() => setShowNewModal(true)}
          />
        )}

        {activeTab === "live" && (
          <LiveTrackerView
            activeSession={activeSession}
            wallets={wallets}
            onStartSession={handleStartLiveSession}
            onAddRebuy={handleAddLiveRebuy}
            onEndSession={handleEndLiveSession}
          />
        )}

        {activeTab === "history" && (
          <SessionsListView
            sessions={sessions}
            onNewSessionClick={() => setShowNewModal(true)}
          />
        )}

        {activeTab === "wallets" && (
          <WalletsView
            wallets={wallets}
            onAddWallet={handleAddWallet}
            onTransfer={handleTransfer}
            onDepositWithdraw={handleDepositWithdraw}
          />
        )}

        {activeTab === "players" && (
          <PlayersView
            players={players}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
          />
        )}

        {activeTab === "tools" && <ToolsView />}
      </main>

      {/* Modal de Cadastro Retroativo */}
      {showNewModal && (
        <NewSessionModal
          wallets={wallets}
          onClose={() => setShowNewModal(false)}
          onSaveSession={handleSaveRetroactiveSession}
        />
      )}

      {/* Modal de Autenticação (Login & Cadastro) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
