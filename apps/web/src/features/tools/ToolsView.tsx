import React, { useState } from "react";
import { Calculator, Percent, Coins } from "lucide-react";
import { calculateICM, calculateChipChop, calculatePotOdds } from "@poker-tracker/shared";

export const ToolsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pot_odds" | "icm" | "chip_chop">("pot_odds");

  // Pot Odds state
  const [potSize, setPotSize] = useState(100);
  const [callAmount, setCallAmount] = useState(25);

  const potOddsResult = calculatePotOdds({ potSize, callAmount });

  // ICM / Chip-Chop state (US10)
  const [stacks, setStacks] = useState<number[]>([50000, 30000, 20000]);
  const [payouts, setPayouts] = useState<number[]>([1000, 600, 400]);

  const icmResult = calculateICM({ stacks, payouts });
  const chipChopResult = calculateChipChop({ stacks, payouts });

  const handleUpdateStack = (idx: number, val: number) => {
    const next = [...stacks];
    next[idx] = val;
    setStacks(next);
  };

  const handleUpdatePayout = (idx: number, val: number) => {
    const next = [...payouts];
    next[idx] = val;
    setPayouts(next);
  };

  const addPlayer = () => {
    setStacks([...stacks, 10000]);
    setPayouts([...payouts, 100]);
  };

  const removePlayer = (idx: number) => {
    if (stacks.length <= 2) return;
    setStacks(stacks.filter((_, i) => i !== idx));
    setPayouts(payouts.filter((_, i) => i !== idx));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Tab Switcher */}
      <div className="bg-poker-card border border-poker-border rounded-2xl p-1.5 flex gap-1 shadow-lg">
        <button
          onClick={() => setActiveTab("pot_odds")}
          className={`touch-target flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "pot_odds"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Calculadora de Pot Odds
        </button>
        <button
          onClick={() => setActiveTab("icm")}
          className={`touch-target flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "icm"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          ICM (Mesa Final)
        </button>
        <button
          onClick={() => setActiveTab("chip_chop")}
          className={`touch-target flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "chip_chop"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Chip-Chop (Deal Proporcional)
        </button>
      </div>

      {/* Pot Odds View */}
      {activeTab === "pot_odds" && (
        <div className="bg-poker-card border border-poker-border rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Calculadora de Pot Odds & Equidade</h2>
              <p className="text-xs text-slate-400">Descubra a porcentagem necessária para pagar a aposta de forma lucrativa</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tamanho do Pote Atual (R$ / Fichas)</label>
              <input
                type="number"
                value={potSize}
                onChange={(e) => setPotSize(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor do Call / Aposta a Pagar</label>
              <input
                type="number"
                value={callAmount}
                onChange={(e) => setCallAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-100"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[11px] text-slate-400">Equidade Necessária</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {potOddsResult.requiredEquityPercentage}%
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Razão de Odds</span>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {potOddsResult.ratio}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Pote Final Total</span>
                <div className="text-2xl font-black text-slate-100 mt-1">
                  {potSize + callAmount}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center border-t border-slate-800 pt-3">
              Você precisa vencer pelo menos <strong className="text-emerald-400">{potOddsResult.requiredEquityPercentage}%</strong> das vezes para o call ter expectativa positiva (+EV).
            </p>
          </div>
        </div>
      )}

      {/* ICM View (US10 - Cenario 01) */}
      {activeTab === "icm" && (
        <div className="bg-poker-card border border-poker-border rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Calculadora ICM (Independent Chip Model)</h2>
                <p className="text-xs text-slate-400">Equidade teórica exata de cada jogador para acordos em mesa final</p>
              </div>
            </div>
            <button
              onClick={addPlayer}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
            >
              + Jogador
            </button>
          </div>

          <div className="space-y-3">
            {stacks.map((stack, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 w-16">Jogador {idx + 1}</span>
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500">Stack (Fichas)</span>
                  <input
                    type="number"
                    value={stack}
                    onChange={(e) => handleUpdateStack(idx, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-bold"
                  />
                </div>

                <div className="flex-1">
                  <span className="text-[10px] text-slate-500">Premiação {idx + 1}º (R$)</span>
                  <input
                    type="number"
                    value={payouts[idx] || 0}
                    onChange={(e) => handleUpdatePayout(idx, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-bold"
                  />
                </div>

                <div className="w-24 text-right">
                  <span className="text-[10px] text-slate-500 block">Equidade ICM</span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    R$ {(icmResult.equity[idx] || 0).toFixed(2)}
                  </span>
                </div>

                {stacks.length > 2 && (
                  <button onClick={() => removePlayer(idx)} className="text-slate-500 hover:text-red-400 text-xs p-1">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chip-Chop View */}
      {activeTab === "chip_chop" && (
        <div className="bg-poker-card border border-poker-border rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Divisão Proporcional (Chip-Chop)</h2>
              <p className="text-xs text-slate-400">Divisão linear do total de premiações conforme percentual de fichas</p>
            </div>
          </div>

          <div className="space-y-3">
            {stacks.map((stack, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">Jogador {idx + 1} ({stack.toLocaleString()} fichas)</span>
                <span className="text-sm font-extrabold text-blue-400">
                  R$ {(chipChopResult.payouts[idx] || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
