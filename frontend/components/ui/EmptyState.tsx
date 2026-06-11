export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
      <div className="text-5xl">📭</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}
