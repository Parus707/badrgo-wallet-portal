'use client';

import Link from 'next/link';
import { User } from '@/lib/api';
import EmptyState from '../ui/EmptyState';

interface Props {
  users: User[];
}

export default function UserTable({ users }: Props) {
  if (users.length === 0) return <EmptyState message="No users yet. Create one above." />;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            {['Name', 'Email', 'Phone', 'Status', 'Wallets'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
              <td className="px-4 py-3 text-slate-500">{user.email}</td>
              <td className="px-4 py-3 text-slate-500">{user.phone}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/users/${user.id}`}
                  className="text-indigo-600 hover:underline text-xs font-medium"
                >
                  View wallets →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
