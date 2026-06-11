'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, OverallStats, formatCents } from '@/lib/api';
import { card } from '@/lib/styles';
import StatCard from '@/components/dashboard/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorAlert from '@/components/ui/ErrorAlert';

export default function DashboardPage() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.reports.overallStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/users" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            Users
          </Link>
          <Link href="/reports" className="border bg-white text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">
            Reports
          </Link>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Wallets" value={stats.totalWallets} color="indigo" />
          <StatCard label="Total balance" value={formatCents(stats.totalBalance)} color="slate" />
          <StatCard label="Credits" value={formatCents(stats.totalCredits)} color="green" />
          <StatCard label="Debits" value={formatCents(stats.totalDebits)} color="red" />
          <StatCard label="Transactions" value={stats.transactionCount} color="indigo" />
        </div>
      )}

      <div className={`${card} p-6`}>
        <h2 className="text-base font-semibold text-slate-700 mb-3">Shortcuts</h2>
        <div className="flex gap-4">
          <Link href="/users" className="text-indigo-600 hover:underline text-sm">Manage users</Link>
          <Link href="/reports" className="text-indigo-600 hover:underline text-sm">Daily reports</Link>
        </div>
      </div>
    </div>
  );
}
