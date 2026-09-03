import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const BrandLogo = ({ size = 'md', showText = true, variant = 'auto', className = '' }) => {
  const { isAuthenticated } = useAuth();

  const iconSizes = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
    lg: 'w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11',
  };

  const textSizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base md:text-lg',
    lg: 'text-base sm:text-lg md:text-xl',
  };

  const eduTextColor = variant === 'light' 
    ? 'text-white' 
    : variant === 'dark' 
    ? 'text-slate-900' 
    : 'text-slate-900 dark:text-white';

  return (
    <Link to="/" className={`inline-flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer select-none no-underline ${className}`}>
      {/* Modern SaaS Geometric Icon Badge */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-[1.5px] shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300 ${iconSizes[size]}`}>
        <div className="w-full h-full bg-slate-900/20 dark:bg-slate-950/40 rounded-[10px] backdrop-blur-sm flex items-center justify-center p-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white overflow-visible">
            <defs>
              <linearGradient id="brand-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#c7d2fe" />
              </linearGradient>
            </defs>
            {/* Minimalist Tech Cap + Growth Node Mark */}
            <path
              d="M12 3.5L2.5 8.25L12 13L21.5 8.25L12 3.5Z"
              stroke="url(#brand-logo-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.5 10.75V16C5.5 16 8.5 18.75 12 18.75C15.5 18.75 18.5 16 18.5 16V10.75"
              stroke="url(#brand-logo-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21.5 8.5V14.5"
              stroke="url(#brand-logo-grad)"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <circle cx="21.5" cy="15.5" r="1.25" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <span className={`font-heading font-black tracking-tight ${eduTextColor} transition-opacity group-hover:opacity-90 ${textSizes[size]}`}>
          Edu<span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Platform</span>
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;
