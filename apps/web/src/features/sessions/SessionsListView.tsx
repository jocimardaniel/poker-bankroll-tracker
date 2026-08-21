import React, { useState } from "react";
import { Filter, DollarSign, Trophy, Search, RefreshCw } from "lucide-react";
import type { Session } from "@poker-tracker/shared";

interface SessionsListViewProps {
  sessions: Session[];
  onNewSessionClick: () => void;
}

export const SessionsListView: React.FC<SessionsListViewProps> = ({
  sessions,
  onNewSessionClick: _onNewSessionClick
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterLocation, setFilterLocation] = useState<string>("ALL");
  const [filterVariant, setFilterVariant] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredSessions = sessions.filter((s) => {
    if (filterType !== "ALL" && s.sessionType !== filterType) return false;
    if (filterLocation !== "ALL" && s.locationType !== filterLocation) return false;
    if (filterVariant !== "ALL" && s.gameVariant !== filterVariant) return false;
    if (searchTerm) {
      const matchLoc = s.locationName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchNotes = (s.notes || "").toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchLoc && !matchNotes) return false;
    }
    return true;
  });

  const totalFilteredProfit = filteredSessions.reduce((acc, s) => acc + (s.netProfit || 0), 0);

  const resetFilters = () => {
    setFilterType("ALL");
    setFilterLocation("ALL");
    setFilterVariant("ALL");
    setSearchTerm("");
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header & Filter Bar */}
      <div className="bg-poker-card border border-poker-border rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              Histórico de Sessões
            </h2>
            <span className="text-xs text-slate-400">
              Exibindo {filteredSessions.length} de {sessions.length} sessões cadastradas
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400">Lucro Filtrado:</span>
            <div className={`text-base sm:text-lg font-bold ${totalFilteredProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalFilteredProfit >= 0 ? "+" : ""}R$ {totalFilteredProfit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filter Controls (US08) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200"
          >
            <option value="ALL">Todas Modalidades</option>
            <option value="CASH_GAME">Cash Game</option>
            <option value="TOURNAMENT">Torneios (MTT)</option>
          </select>

          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200"
          >
            <option value="ALL">Todos Ambientes</option>
            <option value="LIVE">Live (Ao Vivo)</option>
            <option value="ONLINE">Online</option>
          </select>

          <select
            value={filterVariant}
            onChange={(e) => setFilterVariant(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200"
          >
            <option value="ALL">Todas Variantes</option>
            <option value="NLH">NL Hold'em</option>
            <option value="PLO4">PLO 4</option>
            <option value="PLO5">PLO 5</option>
            <option value="SHORT_DECK">Short Deck</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar local/notas..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-200"
            />
          </div>
        </div>

        {(filterType !== "ALL" || filterLocation !== "ALL" || filterVariant !== "ALL" || searchTerm) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-2.5">
        {filteredSessions.length === 0 ? (
          <div className="bg-poker-card border border-poker-border rounded-xl p-8 text-center text-slate-500">
            Nenhuma sessão encontrada para os filtros selecionados.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isProfit = session.netProfit >= 0;
            const isCash = session.sessionType === "CASH_GAME";

            return (
              <div
                key={session.id}
                className="bg-poker-card border border-poker-border hover:border-slate-700 rounded-xl p-4 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isCash ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {isCash ? <DollarSign className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-100">{session.locationName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {session.locationType} • {session.gameVariant}
                      </span>
                      {session.status === "IN_PROGRESS" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold animate-pulse">
                          AO VIVO
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span>{new Date(session.startTime).toLocaleDateString("pt-BR")}</span>
                      <span>•</span>
                      <span>{session.durationMinutes} min</span>
                      {isCash && session.cashGameDetails && (
                        <>
                          <span>•</span>
                          <span>Blinds {session.cashGameDetails.smallBlind}/{session.cashGameDetails.bigBlind}</span>
                        </>
                      )}
                      {!isCash && session.tournamentDetails && (
                        <>
                          <span>•</span>
                          <span>
                            {session.tournamentDetails.finalPosition ? `${session.tournamentDetails.finalPosition}º / ${session.tournamentDetails.totalEntries || "?"}` : "Finalizado"}
                          </span>
                        </>
                      )}
                    </div>

                    {session.notes && (
                      <p className="text-[11px] text-slate-400 mt-1.5 italic bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end">
                  <div className={`text-base sm:text-lg font-black ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                    {isProfit ? "+" : ""}R$ {session.netProfit.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isCash && session.cashGameDetails && session.cashGameDetails.bigBlind > 0
                      ? `${(session.netProfit / session.cashGameDetails.bigBlind).toFixed(1)} BB`
                      : session.tournamentDetails
                      ? session.tournamentDetails.isItm ? "ITM (Premiado)" : "Fora da Premiação"
                      : ""}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
