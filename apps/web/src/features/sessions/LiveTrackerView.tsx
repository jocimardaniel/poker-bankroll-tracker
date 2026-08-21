import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  Plus,
  Flame,
  Clock
} from "lucide-react";
import type { Session, Wallet } from "@poker-tracker/shared";

interface LiveTrackerViewProps {
  activeSession: Session | null;
  wallets: Wallet[];
  onStartSession: (data: {
    walletId: string;
    gameVariant: any;
    locationType: any;
    locationName: string;
    smallBlind: number;
    bigBlind: number;
    initialBuyin: number;
  }) => void;
  onAddRebuy: (amount: number) => void;
  onEndSession: (cashoutAmount: number, tips: number, notes: string) => void;
}

export const LiveTrackerView: React.FC<LiveTrackerViewProps> = ({
  activeSession,
  wallets,
  onStartSession,
  onAddRebuy,
  onEndSession
}) => {
  // Setup state for starting session
  const [walletId, setWalletId] = useState(wallets[0]?.id || "");
  const [locationName, setLocationName] = useState("Live Club H2");
  const [locationType, setLocationType] = useState<"LIVE" | "ONLINE">("LIVE");
  const [gameVariant, setGameVariant] = useState("NLH");
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);
  const [initialBuyin, setInitialBuyin] = useState(500);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [cashoutAmount, setCashoutAmount] = useState(0);
  const [tipsAmount, setTipsAmount] = useState(0);
  const [sessionNotes, setSessionNotes] = useState("");

  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const startTimestamp = new Date(activeSession.startTime).getTime();
    const interval = setInterval(() => {
      if (!isPaused) {
        const now = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((now - startTimestamp) / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, isPaused]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId && wallets.length > 0) {
      setWalletId(wallets[0].id);
    }
    onStartSession({
      walletId: walletId || (wallets[0] ? wallets[0].id : "default-wallet"),
      gameVariant,
      locationType,
      locationName,
      smallBlind,
      bigBlind,
      initialBuyin
    });
  };

  const totalInvested =
    (activeSession?.cashGameDetails?.initialBuyin || 0) +
    (activeSession?.cashGameDetails?.totalRebuys || 0);

  const buyinUnit = activeSession?.cashGameDetails?.initialBuyin || 500;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      {!activeSession ? (
        /* Form para Iniciar Sessão Live */
        <div className="bg-poker-card border border-poker-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Flame className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Iniciar Sessão em Tempo Real</h2>
              <p className="text-xs text-slate-400">Acompanhe seu tempo de jogo, entradas e winrate na mesa</p>
            </div>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Carteira de Origem</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: R$ {w.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Local / Plataforma</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Ex: H2 Club, PokerStars"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipo</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="LIVE">Live (Ao Vivo)</option>
                  <option value="ONLINE">Online</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Modalidade</label>
                <select
                  value={gameVariant}
                  onChange={(e) => setGameVariant(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="NLH">NL Hold'em</option>
                  <option value="PLO4">PLO 4 Cartas</option>
                  <option value="PLO5">PLO 5 Cartas</option>
                  <option value="SHORT_DECK">Short Deck</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Blinds (SB / BB)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={smallBlind}
                    onChange={(e) => setSmallBlind(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2.5 text-xs text-center text-slate-100"
                  />
                  <span className="text-slate-500">/</span>
                  <input
                    type="number"
                    value={bigBlind}
                    onChange={(e) => setBigBlind(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2.5 text-xs text-center text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Buy-in Inicial</label>
                <input
                  type="number"
                  value={initialBuyin}
                  onChange={(e) => setInitialBuyin(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="touch-target w-full mt-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              Começar Sessão Agora
            </button>
          </form>
        </div>
      ) : (
        /* Sessão Ativa em Tempo Real */
        <div className="bg-poker-card border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Header da Sessão */}
          <div className="flex items-center justify-between border-b border-poker-border pb-4">
            <div>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                AO VIVO
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-1">
                {activeSession.locationName} ({activeSession.gameVariant})
              </h2>
              <p className="text-xs text-slate-400">
                Blinds: {activeSession.cashGameDetails?.smallBlind}/{activeSession.cashGameDetails?.bigBlind} • Buy-in inicial: R$ {activeSession.cashGameDetails?.initialBuyin}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Total Investido</span>
              <div className="text-xl font-bold text-amber-400">
                R$ {totalInvested.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Cronômetro Central Gigante */}
          <div className="text-center py-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-1">
              <Clock className="w-4 h-4" />
              <span>Tempo Decorrido</span>
            </div>
            <div className="font-mono text-5xl sm:text-6xl font-black text-slate-100 tracking-wider">
              {formatTimer(elapsedSeconds)}
            </div>
          </div>

          {/* Atalhos Rápidos Touch para Rebuy (US04 - BDD) */}
          <div>
            <span className="block text-xs font-semibold text-slate-300 mb-2">
              Atalhos Rápidos de Rebuy (1-Touch)
            </span>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onAddRebuy(buyinUnit)}
                className="touch-target p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600/30 border border-slate-700 text-xs font-bold text-slate-100 flex flex-col items-center justify-center transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400 mb-1" />
                <span>+1 Buy-in</span>
                <span className="text-[10px] text-slate-400">R$ {buyinUnit}</span>
              </button>

              <button
                type="button"
                onClick={() => onAddRebuy(buyinUnit / 2)}
                className="touch-target p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600/30 border border-slate-700 text-xs font-bold text-slate-100 flex flex-col items-center justify-center transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400 mb-1" />
                <span>+0.5 Buy-in</span>
                <span className="text-[10px] text-slate-400">R$ {buyinUnit / 2}</span>
              </button>

              <button
                type="button"
                onClick={() => onAddRebuy(100)}
                className="touch-target p-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600/30 border border-slate-700 text-xs font-bold text-slate-100 flex flex-col items-center justify-center transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400 mb-1" />
                <span>+R$ 100</span>
                <span className="text-[10px] text-slate-400">Avulso</span>
              </button>
            </div>
          </div>

          {/* Botões de Ação do Cronômetro */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="touch-target py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-current" /> : <Pause className="w-4 h-4 text-amber-400" />}
              {isPaused ? "Retomar Cronômetro" : "Pausar Cronômetro"}
            </button>

            <button
              onClick={() => setShowEndModal(true)}
              className="touch-target py-3 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/40"
            >
              <Square className="w-4 h-4 fill-current" />
              Encerrar Sessão
            </button>
          </div>
        </div>
      )}

      {/* Modal de Encerramento */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-poker-card border border-poker-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Square className="w-4 h-4 text-red-400 fill-current" />
              Finalizar Sessão de Poker
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stack Final (Cash-out)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs text-slate-400">R$</span>
                  <input
                    type="number"
                    value={cashoutAmount}
                    onChange={(e) => setCashoutAmount(Number(e.target.value))}
                    autoFocus
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gorjetas / Despesas (Rake/Tips)</label>
                <input
                  type="number"
                  value={tipsAmount}
                  onChange={(e) => setTipsAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Anotações da Sessão</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={2}
                  placeholder="Observações, mãos memoráveis, dinâmicas da mesa..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Prévia do Resultado */}
              <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Resultado Líquido:</span>
                <span className={`font-extrabold text-sm ${cashoutAmount - totalInvested - tipsAmount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {cashoutAmount - totalInvested - tipsAmount >= 0 ? "+" : ""}R$ {(cashoutAmount - totalInvested - tipsAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="touch-target flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Voltar ao Jogo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndModal(false);
                  onEndSession(cashoutAmount, tipsAmount, sessionNotes);
                }}
                className="touch-target flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40"
              >
                Salvar & Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
