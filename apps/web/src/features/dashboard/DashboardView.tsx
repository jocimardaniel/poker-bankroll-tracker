import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Trophy,
  Activity,
  Flame,
  ArrowUpRight
} from "lucide-react";
import type { Session, Wallet } from "@poker-tracker/shared";

interface DashboardViewProps {
  sessions: Session[];
  wallets: Wallet[];
  onStartLiveSession: () => void;
  onNewSessionClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  wallets,
  onStartLiveSession,
  onNewSessionClick
}) => {
  const totalBankroll = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");
  const totalProfit = completedSessions.reduce((acc, s) => acc + (s.netProfit || 0), 0);

  const cashSessions = completedSessions.filter((s) => s.sessionType === "CASH_GAME");
  const tourneySessions = completedSessions.filter((s) => s.sessionType === "TOURNAMENT");

  const cashProfit = cashSessions.reduce((acc, s) => acc + (s.netProfit || 0), 0);
  const cashHours = cashSessions.reduce((acc, s) => acc + (s.durationMinutes || 0) / 60, 0);
  const cashHourlyRate = cashHours > 0 ? cashProfit / cashHours : 0;

  const tourneyProfit = tourneySessions.reduce((acc, s) => acc + (s.netProfit || 0), 0);
  const tourneyCost = tourneySessions.reduce((acc, s) => {
    const d = s.tournamentDetails;
    return acc + (d ? d.buyinFee + d.entryFee + d.reentriesCost + d.addonsAmount : 0);
  }, 0);
  const tourneyROI = tourneyCost > 0 ? (tourneyProfit / tourneyCost) * 100 : 0;
  const tourneyITMCount = tourneySessions.filter((s) => s.tournamentDetails?.isItm || (s.tournamentDetails?.prizeWon || 0) > 0).length;
  const tourneyITMRate = tourneySessions.length > 0 ? (tourneyITMCount / tourneySessions.length) * 100 : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner / Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-poker-border rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Banca Consolidada Total</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 flex items-center gap-2 mt-1">
              R$ {totalBankroll.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className={`text-xs px-2 py-0.5 rounded-full flex items-center font-bold ${totalProfit >= 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                {totalProfit >= 0 ? "+" : ""}R$ {totalProfit.toFixed(2)} total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Distribuído em {wallets.length} {wallets.length === 1 ? "carteira ativa" : "carteiras ativas"}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onStartLiveSession}
              className="touch-target flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all"
            >
              <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
              Iniciar Live Tracker
            </button>
            <button
              onClick={onNewSessionClick}
              className="touch-target flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              Cadastrar Retroativo
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-poker-card border border-poker-border rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Lucro Cash Game</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${cashProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            R$ {cashProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>R$ {cashHourlyRate.toFixed(2)}/h ({cashHours.toFixed(1)}h)</span>
          </div>
        </div>

        <div className="bg-poker-card border border-poker-border rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Lucro Torneios</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${tourneyProfit >= 0 ? "text-amber-400" : "text-red-400"}`}>
            R$ {tourneyProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>ROI: {tourneyROI.toFixed(1)}% | ITM: {tourneyITMRate.toFixed(0)}%</span>
          </div>
        </div>

        <div className="bg-poker-card border border-poker-border rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total de Sessões</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100">
            {completedSessions.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {cashSessions.length} Cash | {tourneySessions.length} Torneios
          </div>
        </div>

        <div className="bg-poker-card border border-poker-border rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Winrate Global</span>
            {totalProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-100">
            {completedSessions.length > 0
              ? `${((completedSessions.filter((s) => s.netProfit > 0).length / completedSessions.length) * 100).toFixed(0)}%`
              : "0%"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Sessões vencedoras
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="bg-poker-card border border-poker-border rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
          <span>Últimas Sessões Registradas</span>
          <span className="text-xs font-normal text-slate-400">Total: {completedSessions.length}</span>
        </h2>

        {completedSessions.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma sessão finalizada ainda.</p>
            <p className="text-xs mt-1">Inicie o Live Tracker ou cadastre uma sessão retroativa para começar.</p>
          </div>
        ) : (
          <div className="divide-y divide-poker-border/60">
            {completedSessions.slice(0, 5).map((session) => {
              const isProfit = session.netProfit >= 0;
              return (
                <div key={session.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${session.sessionType === "CASH_GAME" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                      {session.sessionType === "CASH_GAME" ? "C" : "T"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                        {session.locationName} ({session.locationType})
                        <span className="text-[10px] text-slate-400 font-normal">
                          {session.gameVariant}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(session.startTime).toLocaleDateString("pt-BR")} • {session.durationMinutes} min
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs sm:text-sm font-bold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                      {isProfit ? "+" : ""}R$ {session.netProfit.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {session.sessionType === "CASH_GAME" && session.cashGameDetails
                        ? `${(session.netProfit / (session.cashGameDetails.bigBlind || 1)).toFixed(1)} BB`
                        : session.tournamentDetails?.isItm ? "ITM" : "Fora do ITM"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
