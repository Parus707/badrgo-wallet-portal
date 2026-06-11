'use client';

import { useState, useEffect } from 'react';
import { api, DailySummary, formatCents } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';
import EmptyState from '@/components/ui/EmptyState';

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchSummaries() {
    setLoading(true);
    setError('');
    try {
      const data = await api.reports.dailySummary(startDate, endDate);
      setSummaries(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSummaries(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daily Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Transaction summaries by day</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); fetchSummaries(); }}
        className="bg-white rounded-xl shadow-sm border p-5 flex flex-wrap items-end gap-4"
      >
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Apply Filter
        </button>
      </form>

      {loading && <LoadingSpinner label="Loading report..." />}
      {error && <ErrorAlert message={error} />}

      {!loading && !error && summaries.length === 0 && (
        <EmptyState message="No transactions found for the selected date range." />
      )}

      {!loading && !error && summaries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['Date', 'Total Credits', 'Total Debits', 'Transactions', 'Active Wallets'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((row) => (
                <tr key={row.date} className="hover:bg-slate-50 transition-colors">
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
