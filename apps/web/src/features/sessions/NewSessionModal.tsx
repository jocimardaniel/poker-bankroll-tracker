import { useState } from "react";
import { X, Trophy, DollarSign } from "lucide-react";
import type { Session, Wallet } from "@poker-tracker/shared";
import { calculateCashGameMetrics, calculateTournamentMetrics } from "@poker-tracker/shared";

interface NewSessionModalProps {
  wallets: Wallet[];
  onClose: () => void;
  onSaveSession: (session: Partial<Session>) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  wallets,
  onClose,
  onSaveSession
}) => {
  const [sessionType, setSessionType] = useState<"CASH_GAME" | "TOURNAMENT">("CASH_GAME");
  const [walletId, setWalletId] = useState(wallets[0]?.id || "");
  const [locationName, setLocationName] = useState("PokerStars");
  const [locationType, setLocationType] = useState<"LIVE" | "ONLINE">("ONLINE");
  const [gameVariant, setGameVariant] = useState("NLH");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [notes, setNotes] = useState("");

  // Cash Game specific state
  const [smallBlind, setSmallBlind] = useState(1);
  const [bigBlind, setBigBlind] = useState(2);
  const [initialBuyin, setInitialBuyin] = useState(200);
  const [totalRebuys, setTotalRebuys] = useState(0);
  const [cashoutAmount, setCashoutAmount] = useState(350);
  const [tipsAndExpenses, setTipsAndExpenses] = useState(0);

  // Tournament specific state (US05)
  const [tournamentFormat, setTournamentFormat] = useState("FREEZEOUT");
  const [buyinFee, setBuyinFee] = useState(50);
  const [entryFee, setEntryFee] = useState(5);
  const [reentriesCount, setReentriesCount] = useState(0);
  const [reentriesCost, setReentriesCost] = useState(0);
  const [addonsAmount, setAddonsAmount] = useState(0);
  const [bountyCollected, setBountyCollected] = useState(0);
  const [prizeWon, setPrizeWon] = useState(0);
  const [totalEntries, setTotalEntries] = useState(100);
  const [finalPosition, setFinalPosition] = useState(10);
  const [isItm, setIsItm] = useState(false);

  // Preview calculations
  const cashMetrics = calculateCashGameMetrics(
    { smallBlind, bigBlind, initialBuyin, totalRebuys, cashoutAmount, tipsAndExpenses },
    durationMinutes
  );

  const tourneyMetrics = calculateTournamentMetrics({
    buyinFee,
    entryFee,
    reentriesCount,
    reentriesCost,
    addonsAmount,
    bountyCollected,
    prizeWon,
    totalEntries,
    finalPosition,
    isItm: isItm || prizeWon > 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedWalletId = walletId || (wallets[0] ? wallets[0].id : "default-wallet");

    if (sessionType === "CASH_GAME") {
      onSaveSession({
        walletId: selectedWalletId,
        sessionType: "CASH_GAME",
        gameVariant: gameVariant as any,
        locationType: locationType as any,
        locationName,
        startTime: new Date(`${sessionDate}T12:00:00Z`).toISOString(),
        durationMinutes,
        netProfit: cashMetrics.netProfit,
        status: "COMPLETED",
        notes,
        cashGameDetails: {
          smallBlind,
          bigBlind,
          initialBuyin,
          totalRebuys,
          cashoutAmount,
          tipsAndExpenses,
          tableSize: "SIX_MAX"
        }
      });
    } else {
      onSaveSession({
        walletId: selectedWalletId,
        sessionType: "TOURNAMENT",
        gameVariant: gameVariant as any,
        locationType: locationType as any,
        locationName,
        startTime: new Date(`${sessionDate}T12:00:00Z`).toISOString(),
        durationMinutes,
        netProfit: tourneyMetrics.netProfit,
        status: "COMPLETED",
        notes,
        tournamentDetails: {
          buyinFee,
          entryFee,
          reentriesCount,
          reentriesCost,
          addonsAmount,
          bountyCollected,
          prizeWon,
          totalEntries,
          finalPosition,
          isItm: tourneyMetrics.isItm,
          tournamentFormat: tournamentFormat as any
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-poker-card border border-poker-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-poker-border pb-3">
          <h2 className="text-base font-bold text-slate-100">Cadastrar Nova Sessão</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modalidade Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSessionType("CASH_GAME")}
            className={`touch-target py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              sessionType === "CASH_GAME"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Cash Game
          </button>
          <button
            type="button"
            onClick={() => setSessionType("TOURNAMENT")}
            className={`touch-target py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              sessionType === "TOURNAMENT"
                ? "bg-amber-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Torneio (MTT/SnG)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* General Fields */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Data</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Carteira</label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name} (R$ {w.balance.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Local / Site</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Ambiente</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100"
              >
                <option value="LIVE">Live</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Variante</label>
              <select
                value={gameVariant}
                onChange={(e) => setGameVariant(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100"
              >
                <option value="NLH">NL Hold'em</option>
                <option value="PLO4">PLO 4</option>
                <option value="PLO5">PLO 5</option>
                <option value="SHORT_DECK">Short Deck</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Duração (minutos)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100"
              />
            </div>
          </div>

          {/* Cash Game specific inputs */}
          {sessionType === "CASH_GAME" && (
            <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Small / Big Blind</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={smallBlind}
                      onChange={(e) => setSmallBlind(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-center text-slate-100"
                    />
                    <span className="text-slate-500">/</span>
                    <input
                      type="number"
                      value={bigBlind}
                      onChange={(e) => setBigBlind(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-center text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Buy-in Inicial (R$)</label>
                  <input
                    type="number"
                    value={initialBuyin}
                    onChange={(e) => setInitialBuyin(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Rebuys Totais (R$)</label>
                  <input
                    type="number"
                    value={totalRebuys}
                    onChange={(e) => setTotalRebuys(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Cash-out (Stack Final)</label>
                  <input
                    type="number"
                    value={cashoutAmount}
                    onChange={(e) => setCashoutAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100 font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Gorjetas/Rake</label>
                  <input
                    type="number"
                    value={tipsAndExpenses}
                    onChange={(e) => setTipsAndExpenses(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Lucro Líquido:</span>
                <span className={`font-bold ${cashMetrics.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {cashMetrics.netProfit >= 0 ? "+" : ""}R$ {cashMetrics.netProfit.toFixed(2)} ({cashMetrics.profitInBB.toFixed(1)} BB)
                </span>
              </div>
            </div>
          )}

          {/* Tournament specific inputs (US05) */}
          {sessionType === "TOURNAMENT" && (
            <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Formato</label>
                  <select
                    value={tournamentFormat}
                    onChange={(e) => setTournamentFormat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100"
                  >
                    <option value="FREEZEOUT">MTT Freezeout</option>
                    <option value="REBUY_ADDON">Rebuy + Add-on</option>
                    <option value="PKO_BOUNTY">PKO / Bounties</option>
                    <option value="SNG_SINGLE_TABLE">SnG Single Table</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Inscrição (Buy-in + Taxa)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={buyinFee}
                      onChange={(e) => setBuyinFee(Number(e.target.value))}
                      placeholder="Buyin"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                    />
                    <span className="text-slate-500">+</span>
                    <input
                      type="number"
                      value={entryFee}
                      onChange={(e) => setEntryFee(Number(e.target.value))}
                      placeholder="Taxa"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Qtd Re-entries</label>
                  <input
                    type="number"
                    value={reentriesCount}
                    onChange={(e) => setReentriesCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Custo Re-entries</label>
                  <input
                    type="number"
                    value={reentriesCost}
                    onChange={(e) => setReentriesCost(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Add-ons (R$)</label>
                  <input
                    type="number"
                    value={addonsAmount}
                    onChange={(e) => setAddonsAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bounties Coletados</label>
                  <input
                    type="number"
                    value={bountyCollected}
                    onChange={(e) => setBountyCollected(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Premiação / Deal (R$)</label>
                  <input
                    type="number"
                    value={prizeWon}
                    onChange={(e) => {
                      setPrizeWon(Number(e.target.value));
                      if (Number(e.target.value) > 0) setIsItm(true);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100 font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Posição Final / Entradas</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={finalPosition}
                      onChange={(e) => setFinalPosition(Number(e.target.value))}
                      placeholder="Pos"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100 text-center"
                    />
                    <span className="text-slate-500">de</span>
                    <input
                      type="number"
                      value={totalEntries}
                      onChange={(e) => setTotalEntries(Number(e.target.value))}
                      placeholder="Total"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-100 text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isItm || prizeWon > 0}
                      onChange={(e) => setIsItm(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-xs text-slate-200 font-medium">ITM</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-400">Resultado / ROI%:</span>
                <span className={`font-bold ${tourneyMetrics.netProfit >= 0 ? "text-amber-400" : "text-red-400"}`}>
                  {tourneyMetrics.netProfit >= 0 ? "+" : ""}R$ {tourneyMetrics.netProfit.toFixed(2)} (ROI: {tourneyMetrics.roiPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Notas da Sessão</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="touch-target flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="touch-target flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40"
            >
              Salvar Sessão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
