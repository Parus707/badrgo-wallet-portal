export default function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-12 text-center text-sm text-slate-400">{message}</p>
  );
}
