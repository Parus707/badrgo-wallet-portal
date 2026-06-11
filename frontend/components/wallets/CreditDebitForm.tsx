'use client';

import { useState } from 'react';
import { api, Transaction } from '@/lib/api';

interface Props {
  walletId: string;
  onSuccess: (tx: Transaction) => void;
}

export default function CreditDebitForm({ walletId, onSuccess }: Props) {
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amountCents = Math.round(parseFloat(amountDisplay) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const fn = type === 'credit' ? api.wallets.credit : api.wallets.debit;
      const tx = await fn(walletId, { amount: amountCents, referenceId, description });
      setSuccess(`${type === 'credit' ? 'Credited' : 'Debited'} $${(amountCents / 100).toFixed(2)}`);
      setAmountDisplay('');
      setReferenceId('');
      setDescription('');
      onSuccess(tx);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">New Transaction</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {success}
        </p>
      )}

      <div className="flex gap-2">
        {(['credit', 'debit'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${
              type === t
                ? t === 'credit'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-red-600 text-white border-red-600'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Amount ($)</label>
        <input
          required
          type="number"
          step="0.01"
          min="0.01"
          value={amountDisplay}
          onChange={(e) => setAmountDisplay(e.target.value)}
          placeholder="10.50"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Reference ID</label>
        <input
          required
          value={referenceId}
          onChange={(e) => setReferenceId(e.target.value)}
          placeholder="order-2024-001"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
          type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {loading ? 'Processing...' : `Submit ${type}`}
      </button>
    </form>
  );
}
