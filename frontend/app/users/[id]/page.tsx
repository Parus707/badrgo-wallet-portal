'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, User, Wallet, formatCents } from '@/lib/api';
import { card, inputInline } from '@/lib/styles';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import EmptyState from '@/components/ui/EmptyState';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'PKR'>('USD');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    Promise.all([
      api.users.list().then((users) => users.find((u) => u.id === id) ?? null),
      api.wallets.listByUser(id),
    ])
      .then(([u, w]) => { setUser(u); setWallets(w); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function addWallet(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      const wallet = await api.wallets.create({ userId: id, currency });
      setWallets((prev) => [wallet, ...prev]);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!user) return <ErrorAlert message="User not found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users" className="text-indigo-600 hover:underline text-sm">Users</Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
        }`}>{user.status}</span>
      </div>

      <div className={`${card} p-5 text-sm text-slate-600`}>
        <p>{user.email} · {user.phone}</p>
      </div>

      <form onSubmit={addWallet} className={`${card} p-5 flex items-end gap-3`}>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as typeof currency)}
            className={inputInline}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="PKR">PKR</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {creating ? 'Adding...' : 'Add wallet'}
        </button>
        {createError && <p className="text-sm text-red-600">{createError}</p>}
      </form>

      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Wallets</h2>
        {wallets.length === 0 ? (
          <EmptyState message="No wallets for this user." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((w) => (
              <Link
                key={w.id}
                href={`/wallets/${w.id}`}
                className={`${card} p-5 hover:border-indigo-400 block`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">{w.currency}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    w.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>{w.status}</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{formatCents(Number(w.balance), w.currency)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
