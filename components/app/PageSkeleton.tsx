export function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-surface-2" />
        <div className="h-8 w-48 rounded bg-surface-2" />
      </div>
      <div className="h-24 rounded-2xl bg-surface-2 border border-white/[0.06]" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 rounded-xl bg-surface-2 border border-white/[0.06]" />
        <div className="h-20 rounded-xl bg-surface-2 border border-white/[0.06]" />
        <div className="h-20 rounded-xl bg-surface-2 border border-white/[0.06]" />
      </div>
      <div className="space-y-3">
        <div className="h-16 rounded-xl bg-surface-2 border border-white/[0.06]" />
        <div className="h-16 rounded-xl bg-surface-2 border border-white/[0.06]" />
        <div className="h-16 rounded-xl bg-surface-2 border border-white/[0.06]" />
      </div>
    </div>
  );
}
