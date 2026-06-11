'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, OverallStats, formatCents } from '@/lib/api';
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
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/users"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Manage Users
          </Link>
          <Link
            href="/reports"
            className="bg-white border text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            View Reports
          </Link>
        </div>
      </div>

      {loading && <LoadingSpinner label="Loading stats..." />}
      {error && <ErrorAlert message={error} />}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Wallets"
            value={stats.totalWallets}
            color="indigo"
          />
          <StatCard
            label="Total Balance"
            value={formatCents(stats.totalBalance)}
            sub="Across all wallets"
            color="slate"
          />
          <StatCard
            label="Total Credits"
            value={formatCents(stats.totalCredits)}
            color="green"
          />
          <StatCard
            label="Total Debits"
            value={formatCents(stats.totalDebits)}
            color="red"
          />
          <StatCard
            label="Transactions"
            value={stats.transactionCount}
            color="indigo"
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/users', title: 'Users', desc: 'Create and manage users' },
            { href: '/reports', title: 'Reports', desc: 'Daily transaction summaries' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block p-4 border rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <p className="font-medium text-slate-700">{item.title}</p>
              <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
