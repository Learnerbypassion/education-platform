import { Link } from 'react-router-dom';

const BrandLogo = ({ size = 'md', showText = true, variant = 'auto', className = '' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const eduTextColor = variant === 'light' 
    ? 'text-white' 
    : variant === 'dark' 
    ? 'text-slate-900' 
    : 'text-slate-900 dark:text-white';

  return (
    <Link to="/" className={`inline-flex items-center gap-2 group cursor-pointer select-none no-underline ${className}`}>
      {/* Minimal Architectural Mark */}
      <div className={`relative flex items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs transition-transform duration-150 group-hover:scale-105 ${iconSizes[size]}`}>
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor">
          <path
            d="M10 3L2.5 7L10 11L17.5 7L10 3Z"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 8.5V13.5C5 13.5 7.5 15.5 10 15.5C12.5 15.5 15 13.5 15 13.5V8.5"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.5 7.5V12.5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <span className={`font-heading tracking-tight font-bold ${eduTextColor} ${textSizes[size]}`}>
          <span>Edu</span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">Platform</span>
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;
