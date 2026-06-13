export default function RewardCard({ title, value, count, subtitle, icon, accent = "from-emerald-500 to-blue-500" }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-3xl bg-gradient-to-br ${accent} p-3 text-white shadow-lg`}>{icon}</div>
      </div>
      {subtitle && <p className="mt-4 text-sm text-slate-500">{subtitle}</p>}
      {typeof count !== "undefined" && <div className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">{count} cards</div>}
    </div>
  );
}
