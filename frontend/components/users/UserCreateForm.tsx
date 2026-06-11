'use client';

import { useState } from 'react';
import { api, User } from '@/lib/api';
import { card, input } from '@/lib/styles';

interface Props {
  onCreated: (user: User) => void;
}

export default function UserCreateForm({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFlash('');
    setBusy(true);

    try {
      const user = await api.users.create({ name, phone, email });
      setFlash(`Added ${user.name}`);
      setName('');
      setPhone('');
      setEmail('');
      onCreated(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={`${card} p-6 space-y-4`}>
      <h2 className="text-lg font-semibold text-slate-800">Add user</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}
      {flash && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{flash}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
