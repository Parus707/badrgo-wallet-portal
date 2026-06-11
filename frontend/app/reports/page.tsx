'use client';

import { useState, useEffect } from 'react';
import { api, DailySummary, formatCents } from '@/lib/api';
import { card, inputInline, th } from '@/lib/styles';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import EmptyState from '@/components/ui/EmptyState';

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(weekAgo);
  const [endDate, setEndDate] = useState(today);
  const [rows, setRows] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setRows(await api.reports.dailySummary(startDate, endDate));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daily reports</h1>
        <p className="text-sm text-slate-500 mt-1">Credits and debits grouped by day</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); load(); }}
        className={`${card} p-5 flex flex-wrap items-end gap-4`}
      >
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputInline} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputInline} />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          Run
        </button>
      </form>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState message="Nothing in that date range." />
      )}

      {!loading && !error && rows.length > 0 && (
        <div className={`${card} overflow-hidden`}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className={th}>Date</th>
                <th className={th}>Credits</th>
                <th className={th}>Debits</th>
                <th className={th}>Tx count</th>
                <th className={th}>Active wallets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.date} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.date}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{formatCents(row.totalCredits)}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">{formatCents(row.totalDebits)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.transactionCount}</td>
                  <td className="px-4 py-3 text-slate-600">{row.activeWallets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
