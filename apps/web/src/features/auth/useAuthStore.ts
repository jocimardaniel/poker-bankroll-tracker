import { create } from "zustand";
import type { User, Currency } from "@poker-tracker/shared";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, preferredCurrency?: Currency) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const STORAGE_KEY_USER = "poker_tracker_user";
const STORAGE_KEY_TOKEN = "poker_tracker_token";

export const useAuthStore = create<AuthState>((set) => {
  // Load initial from localStorage
  const savedUser = localStorage.getItem(STORAGE_KEY_USER);
  const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao efetuar login.");
        }

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);

        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false
        });

        return true;
      } catch (err: any) {
        // Fallback para login offline / demo se a API estiver indisponível
        if (email === "jogador@poker.com" && password === "poker123") {
          const demoUser: User = {
            id: "usr-demo-1",
            name: "Jogador Pro",
            email: "jogador@poker.com",
            preferredCurrency: "BRL",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoUser));
          localStorage.setItem(STORAGE_KEY_TOKEN, "demo-offline-jwt-token");
          set({
            user: demoUser,
            token: "demo-offline-jwt-token",
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        }

        set({
          error: err.message || "Falha na autenticação.",
          isLoading: false
        });
        return false;
      }
    },

    register: async (name: string, email: string, password: string, preferredCurrency: Currency = "BRL") => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, preferredCurrency })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao registrar usuário.");
        }

        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEY_TOKEN, data.token);

        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false
        });

        return true;
      } catch (err: any) {
        set({
          error: err.message || "Erro ao criar conta.",
          isLoading: false
        });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null
      });
    },

    clearError: () => set({ error: null })
  };
});
