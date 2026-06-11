interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'indigo' | 'green' | 'red' | 'slate';
}

const colorMap = {
  indigo: 'border-l-indigo-500 bg-indigo-50',
  green: 'border-l-green-500 bg-green-50',
  red: 'border-l-red-500 bg-red-50',
  slate: 'border-l-slate-500 bg-slate-50',
};

export default function StatCard({ label, value, sub, color = 'indigo' }: StatCardProps) {
  return (
    <div className={`rounded-xl border-l-4 p-5 shadow-sm ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
