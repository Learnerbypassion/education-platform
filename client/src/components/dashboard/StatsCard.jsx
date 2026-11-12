const StatsCard = ({ icon, label, value, color, trend }) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-5 flex flex-col justify-between shadow-xs">
    <div className="flex items-center justify-between gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
        <span className="text-lg">{icon}</span>
      </div>
      {trend && (
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${trend > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}>
          {trend > 0 ? '+' : '-'}{Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-4 space-y-0.5">
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

export default StatsCard;
