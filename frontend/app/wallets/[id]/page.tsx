'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Wallet, Transaction, formatCents } from '@/lib/api';
import CreditDebitForm from '@/components/wallets/CreditDebitForm';
import TransactionList from '@/components/wallets/TransactionList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

export default function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [w, txs] = await Promise.all([
        api.wallets.get(id),
        api.wallets.transactions(id),
      ]);
      setWallet(w);
      setTransactions(txs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [id]);

  function handleTransactionSuccess(tx: Transaction) {
    setTransactions((prev) => [tx, ...prev]);
    api.wallets.get(id).then(setWallet).catch(() => {});
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!wallet) return <ErrorAlert message="Wallet not found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/users" className="text-indigo-600 hover:underline text-sm">← Users</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 text-sm font-mono">{wallet.id}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">
              {wallet.currency} Wallet
            </p>
            <p className="text-4xl font-bold text-slate-800 mt-1">
              {formatCents(Number(wallet.balance), wallet.currency)}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Created {new Date(wallet.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
            wallet.status === 'active'
              ? 'bg-green-100 text-green-700'
              : wallet.status === 'suspended'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {wallet.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CreditDebitForm walletId={id} onSuccess={handleTransactionSuccess} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-700 mb-3">
            Transactions ({transactions.length})
          </h2>
          <TransactionList transactions={transactions} currency={wallet.currency} />
        </div>
      </div>
    </div>
  );
}
