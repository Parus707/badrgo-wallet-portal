'use client';

import { useState } from 'react';
import { api, Transaction } from '@/lib/api';
import { card, input } from '@/lib/styles';

interface Props {
  walletId: string;
  onSuccess: (tx: Transaction) => void;
}

export default function CreditDebitForm({ walletId, onSuccess }: Props) {
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFlash('');

    const cents = Math.round(parseFloat(amountDisplay) * 100);
    if (isNaN(cents) || cents <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    setBusy(true);
    try {
      const call = type === 'credit' ? api.wallets.credit : api.wallets.debit;
      const tx = await call(walletId, { amount: cents, referenceId, description });
      setFlash(`${type === 'credit' ? 'Credited' : 'Debited'} $${(cents / 100).toFixed(2)}`);
      setAmountDisplay('');
      setReferenceId('');
      setDescription('');
      onSuccess(tx);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const toggle =
    'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors';
  const toggleOn =
    type === 'credit'
      ? 'bg-green-600 text-white border-green-600'
      : 'bg-red-600 text-white border-red-600';
  const toggleOff = 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50';

  return (
    <form onSubmit={submit} className={`${card} p-6 space-y-4`}>
      <h2 className="text-lg font-semibold text-slate-800">New transaction</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
      {flash && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {flash}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('credit')}
          className={`${toggle} ${type === 'credit' ? toggleOn : toggleOff}`}
        >
          Credit
        </button>
        <button
          type="button"
          onClick={() => setType('debit')}
          className={`${toggle} ${type === 'debit' ? toggleOn : toggleOff}`}
        >
          Debit
        </button>
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
          className={input}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Reference ID</label>
        <input
          required
          value={referenceId}
          onChange={(e) => setReferenceId(e.target.value)}
          className={input}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="optional"
          className={input}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className={`w-full py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
          type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {busy ? 'One sec...' : type === 'credit' ? 'Credit wallet' : 'Debit wallet'}
      </button>
    </form>
  );
}
