import './StatsCard.css';

const StatsCard = ({ icon, label, value, color = 'var(--color-primary)', trend }) => (
  <div className="stats-card glass-card">
    <div className="stats-card-icon" style={{ '--stat-color': color }}>
      {icon}
    </div>
    <div className="stats-card-info">
      <span className="stats-card-value">{value}</span>
      <span className="stats-card-label">{label}</span>
    </div>
    {trend && (
      <span className={`stats-card-trend ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    )}
  </div>
);

export default StatsCard;
