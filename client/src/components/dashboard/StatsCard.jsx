const StatsCard = ({ icon, label, value, color = '#6366f1', trend }) => (
  <div className="bento-card p-6 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="flex items-center justify-between gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm border border-slate-200/80 dark:border-slate-800" style={{ backgroundColor: `${color}15`, color }}>
        <span className="text-xl">{icon}</span>
      </div>
      {trend && (
        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${trend > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="mt-5 space-y-1">
      <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

export default StatsCard;
