const StatsCard = ({ icon, label, value, color = '#6366f1', trend }) => (
  <div className="glass-card p-5 hover-lift">
    <div className="flex items-center justify-between gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-110" style={{ backgroundColor: `${color}18`, color }}>
        {icon}
      </div>
      {trend && (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${trend > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="mt-5">
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{label}</p>
    </div>
  </div>
);

export default StatsCard;
