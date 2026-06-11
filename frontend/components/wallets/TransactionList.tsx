import { Transaction, formatCents } from '@/lib/api';
import { card, th } from '@/lib/styles';
import EmptyState from '../ui/EmptyState';

interface Props {
  transactions: Transaction[];
  currency?: string;
}

export default function TransactionList({ transactions, currency = 'USD' }: Props) {
  if (transactions.length === 0) {
    return <EmptyState message="No transactions yet." />;
  }

  return (
    <div className={`${card} overflow-hidden`}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className={th}>Type</th>
            <th className={th}>Amount</th>
            <th className={th}>Before</th>
            <th className={th}>After</th>
            <th className={th}>Ref</th>
            <th className={th}>Note</th>
            <th className={th}>When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  tx.type === 'credit'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {tx.type}
                </span>
              </td>
              <td className={`px-4 py-3 font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'credit' ? '+' : '-'}{formatCents(Number(tx.amount), currency)}
              </td>
              <td className="px-4 py-3 text-slate-500">{formatCents(Number(tx.balanceBefore), currency)}</td>
              <td className="px-4 py-3 text-slate-800 font-medium">{formatCents(Number(tx.balanceAfter), currency)}</td>
              <td className="px-4 py-3 text-xs text-slate-500 font-mono">{tx.referenceId}</td>
              <td className="px-4 py-3 text-slate-400 text-xs">{tx.description ?? '-'}</td>
              <td className="px-4 py-3 text-slate-400 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
