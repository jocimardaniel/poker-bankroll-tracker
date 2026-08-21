import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, LogIn, UserPlus, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuthStore } from "./useAuthStore";
import type { Currency } from "@poker-tracker/shared";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { login, register, isLoading, error, clearError } = useAuthStore();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState<Currency>("BRL");
  const [validationMsg, setValidationMsg] = useState("");

  if (!isOpen) return null;

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (!/[a-zA-Z]/.test(pass)) return "A senha deve conter pelo menos uma letra.";
    if (!/[0-9]/.test(pass)) return "A senha deve conter pelo menos um número.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationMsg("");

    if (mode === "register") {
      const passError = validatePassword(password);
      if (passError) {
        setValidationMsg(passError);
        return;
      }

      const success = await register(name, email, password, currency);
      if (success) {
        onClose();
      }
    } else {
      const success = await login(email, password);
      if (success) {
        onClose();
      }
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    setValidationMsg("");
    setEmail("jogador@poker.com");
    setPassword("poker123");
    const success = await login("jogador@poker.com", "poker123");
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-poker-card border border-poker-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-poker-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              ♠
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {mode === "login" ? "Entrar na Conta" : "Criar Nova Conta"}
              </h2>
              <span className="text-xs text-slate-400">
                {mode === "login" ? "Acesse seu histórico e gestão de banca" : "Cadastre-se para sincronizar seus dados"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              clearError();
              setValidationMsg("");
            }}
            className={`touch-target py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "login"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1.5" />
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              clearError();
              setValidationMsg("");
            }}
            className={`touch-target py-2 rounded-lg text-xs font-bold transition-all ${
              mode === "register"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
            Criar Conta
          </button>
        </div>

        {/* Feedback Alerts */}
        {(error || validationMsg) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationMsg || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome ou nickname"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Mínimo 8 caracteres (letras e números)" : "Sua senha"}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {mode === "register" && (
              <span className="text-[10px] text-slate-500 mt-1 block">
                Mínimo 8 caracteres com letras e números (US01).
              </span>
            )}
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Moeda Principal da Banca</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="BRL">Real Brasileiro (BRL - R$)</option>
                <option value="USD">Dólar Americano (USD - $)</option>
                <option value="EUR">Euro (EUR - €)</option>
                <option value="GBP">Libra Esterlina (GBP - £)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="touch-target w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                Entrar no WebApp
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Criar Minha Conta
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="px-2 text-[10px] text-slate-500 uppercase">Ou teste rapidamente</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        {/* Demo 1-Click Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="touch-target w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Entrar como Jogador Pro (Demo)
        </button>
      </div>
    </div>
  );
};
