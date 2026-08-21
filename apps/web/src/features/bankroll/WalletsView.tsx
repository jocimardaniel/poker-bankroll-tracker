import React, { useState } from "react";
import { Wallet as WalletIcon, ArrowRightLeft, Plus, TrendingUp } from "lucide-react";
import type { Wallet } from "@poker-tracker/shared";

interface WalletsViewProps {
  wallets: Wallet[];
  onAddWallet: (name: string, currency: any, initialBalance: number) => void;
  onTransfer: (fromWalletId: string, toWalletId: string, amount: number) => void;
  onDepositWithdraw: (walletId: string, type: "DEPOSIT" | "WITHDRAWAL", amount: number) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({
  wallets,
  onAddWallet,
  onTransfer,
  onDepositWithdraw
}) => {
  const [showNewWalletModal, setShowNewWalletModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // New Wallet form
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState(1000);
  const [newWalletCurrency, setNewWalletCurrency] = useState("BRL");

  // Transfer form (US02 - Cenario 02)
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || "");
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || wallets[0]?.id || "");
  const [transferAmount, setTransferAmount] = useState(500);

  // Deposit/Withdraw form
  const [targetWalletId, setTargetWalletId] = useState(wallets[0]?.id || "");
  const [operationType, setOperationType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [operationAmount, setOperationAmount] = useState(200);

  const totalConsolidated = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    onAddWallet(newWalletName, newWalletCurrency, newWalletBalance);
    setShowNewWalletModal(false);
    setNewWalletName("");
    setNewWalletBalance(0);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWalletId === toWalletId || transferAmount <= 0) return;
    onTransfer(fromWalletId, toWalletId, transferAmount);
    setShowTransferModal(false);
  };

  const handleExecuteDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (operationAmount <= 0) return;
    onDepositWithdraw(targetWalletId, operationType, operationAmount);
    setShowDepositModal(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Bankroll Summary */}
      <div className="bg-poker-card border border-poker-border rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Saldo Total Consolidado</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-1">
            R$ {totalConsolidated.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">{wallets.length} Carteiras / Cofres Ativos</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowTransferModal(true)}
            className="touch-target flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            Transferir
          </button>
          <button
            onClick={() => setShowDepositModal(true)}
            className="touch-target flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Aporte / Saque
          </button>
          <button
            onClick={() => setShowNewWalletModal(true)}
            className="touch-target flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            Nova Carteira
          </button>
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="bg-poker-card border border-poker-border rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <WalletIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{wallet.name}</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{wallet.currency}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400">Saldo Disponível</span>
              <div className="text-2xl font-black text-slate-100 mt-0.5">
                R$ {(wallet.balance || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{((wallet.balance / (totalConsolidated || 1)) * 100).toFixed(1)}% da banca</span>
              <span className="text-emerald-400 font-medium">Ativa</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Carteira (US02 - Cenario 01) */}
      {showNewWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-poker-card border border-poker-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Adicionar Nova Carteira / Cofre</h3>
            <form onSubmit={handleCreateWallet} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Carteira</label>
                <input
                  type="text"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="Ex: Club H2 Live, PokerStars, GG Poker"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Moeda</label>
                  <select
                    value={newWalletCurrency}
                    onChange={(e) => setNewWalletCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Saldo Inicial (R$)</label>
                  <input
                    type="number"
                    value={newWalletBalance}
                    onChange={(e) => setNewWalletBalance(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWalletModal(false)}
                  className="touch-target flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="touch-target flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Criar Carteira
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transferência (US02 - Cenario 02) */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-poker-card border border-poker-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              Transferência entre Carteiras
            </h3>
            <form onSubmit={handleExecuteTransfer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Origem</label>
                <select
                  value={fromWalletId}
                  onChange={(e) => setFromWalletId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} (R$ {w.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destino</label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} (R$ {w.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor da Transferência (R$)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold text-blue-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="touch-target flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="touch-target flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Confirmar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aporte/Saque */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-poker-card border border-poker-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Registrar Aporte / Saque</h3>
            <form onSubmit={handleExecuteDeposit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOperationType("DEPOSIT")}
                  className={`touch-target py-2 rounded-lg text-xs font-bold ${operationType === "DEPOSIT" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
                >
                  Aporte (+ Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => setOperationType("WITHDRAWAL")}
                  className={`touch-target py-2 rounded-lg text-xs font-bold ${operationType === "WITHDRAWAL" ? "bg-red-600 text-white" : "text-slate-400"}`}
                >
                  Saque (- Retirada)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Carteira</label>
                <select
                  value={targetWalletId}
                  onChange={(e) => setTargetWalletId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name} (R$ {w.balance.toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={operationAmount}
                  onChange={(e) => setOperationAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="touch-target flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="touch-target flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
