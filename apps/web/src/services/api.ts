import type {
  CreateWalletInput,
  CreateSessionInput,
  AddRebuyInput,
  EndSessionInput,
  SyncBatchPayload,
  SyncBatchResult
} from "@poker-tracker/shared";

const API_BASE = "";

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("poker_tracker_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string; preferredCurrency: string }) =>
      request<{ user: any; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    login: (data: { email: string; password: string }) =>
      request<{ user: any; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    getMe: () => request<{ user: any }>("/api/auth/me")
  },

  wallets: {
    list: () => request<{ wallets: any[] }>("/api/wallets"),
    create: (data: CreateWalletInput) =>
      request<{ wallet: any }>("/api/wallets", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    transfer: (data: { sourceWalletId: string; targetWalletId: string; amount: number; description?: string }) =>
      request<{ success: boolean; sourceWallet: any; targetWallet: any }>("/api/wallets/transfer", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    depositWithdraw: (data: { walletId: string; type: "DEPOSIT" | "WITHDRAWAL"; amount: number; description?: string }) =>
      request<{ success: boolean; wallet: any }>("/api/wallets/deposit-withdraw", {
        method: "POST",
        body: JSON.stringify(data)
      })
  },

  sessions: {
    list: () => request<{ sessions: any[] }>("/api/sessions"),
    getById: (id: string) => request<{ session: any }>(`/api/sessions/${id}`),
    create: (data: CreateSessionInput) =>
      request<{ session: any }>("/api/sessions", {
        method: "POST",
        body: JSON.stringify(data)
      }),
    addRebuy: (sessionId: string, data: AddRebuyInput) =>
      request<{ session: any }>(`/api/sessions/${sessionId}/rebuys`, {
        method: "POST",
        body: JSON.stringify(data)
      }),
    endSession: (sessionId: string, data: EndSessionInput) =>
      request<{ session: any }>(`/api/sessions/${sessionId}/end`, {
        method: "POST",
        body: JSON.stringify(data)
      })
  },

  sync: {
    batch: (payload: SyncBatchPayload) =>
      request<SyncBatchResult>("/api/sync/batch", {
        method: "POST",
        body: JSON.stringify(payload)
      })
  }
};
