const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const raw = data.message ?? data.error ?? 'Request failed';
    const message = Array.isArray(raw) ? raw.join(', ') : raw;
    throw new Error(message);
  }

  return data as T;
}

export type UserStatus = 'active' | 'inactive';
export type WalletStatus = 'active' | 'suspended' | 'closed';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'PKR';
export type TransactionType = 'credit' | 'debit';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: Currency;
  balance: number;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string;
  description?: string;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
  activeWallets: number;
}

export interface OverallStats {
  totalWallets: number;
  totalBalance: number;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
}

export const api = {
  users: {
    create: (body: { name: string; phone: string; email: string; status?: UserStatus }) =>
      request<User>('/users', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<User[]>('/users'),
  },
  wallets: {
    create: (body: { userId: string; currency: Currency }) =>
      request<Wallet>('/wallets', { method: 'POST', body: JSON.stringify(body) }),
    listByUser: (userId: string) => request<Wallet[]>(`/wallets?userId=${userId}`),
    get: (id: string) => request<Wallet>(`/wallets/${id}`),
    credit: (id: string, body: { amount: number; referenceId: string; description?: string }) =>
      request<Transaction>(`/wallets/${id}/credit`, { method: 'POST', body: JSON.stringify(body) }),
    debit: (id: string, body: { amount: number; referenceId: string; description?: string }) =>
      request<Transaction>(`/wallets/${id}/debit`, { method: 'POST', body: JSON.stringify(body) }),
    transactions: (id: string) => request<Transaction[]>(`/wallets/${id}/transactions`),
  },
  reports: {
    dailySummary: (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      return request<DailySummary[]>(`/reports/daily-summary?${params}`);
    },
    overallStats: () => request<OverallStats>('/reports/overall-stats'),
  },
};

export function formatCents(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
