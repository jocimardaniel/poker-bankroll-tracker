import React from "react";
import {
  LayoutDashboard,
  Timer,
  History,
  Wallet,
  Users,
  Calculator,
  PlusCircle,
  Wifi,
  WifiOff,
  LogIn,
  LogOut,
} from "lucide-react";
import type { User } from "@poker-tracker/shared";

export type ActiveTab =
  | "dashboard"
  | "live"
  | "history"
  | "wallets"
  | "players"
  | "tools";

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewSessionClick: () => void;
  isOnline: boolean;
  user: User | null;
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onNewSessionClick,
  isOnline,
  user,
  isAuthenticated,
  onOpenAuthModal,
  onLogout
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "live", label: "Live Tracker", icon: Timer },
    { id: "history", label: "Histórico", icon: History },
    { id: "wallets", label: "Banca / Cofres", icon: Wallet },
    { id: "players", label: "Vilões / Notas", icon: Users },
    { id: "tools", label: "Calculadoras", icon: Calculator }
  ] as const;

  return (
    <>
      {/* Top Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-poker-card/90 backdrop-blur-md border-b border-poker-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/30">
              ♠
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Poker Bankroll Tracker
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                  v2.0 PWA
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online/Offline status indicator */}
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-amber-400">Offline</span>
                </>
              )}
            </div>

            {/* Quick new session button */}
            <button
              onClick={onNewSessionClick}
              className="touch-target px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Sessão</span>
            </button>

            {/* Auth Profile / Login Button */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-xs font-bold text-slate-200 block leading-tight">{user.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block leading-tight">{user.preferredCurrency}</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="touch-target px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Navigation Sub-bar */}
      <div className="hidden md:block bg-poker-card/50 border-b border-poker-border">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
                  isActive
                    ? "border-emerald-500 text-emerald-400 bg-emerald-500/5 font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-poker-card/95 backdrop-blur-md border-t border-poker-border px-2 py-1">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`touch-target flex-col gap-0.5 text-[10px] rounded-lg transition-colors ${
                  isActive
                    ? "text-emerald-400 bg-emerald-500/10 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate max-w-[50px]">{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
