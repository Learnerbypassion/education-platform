import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/common/BrandLogo';
import { HiOutlineAcademicCap } from 'react-icons/hi';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080a] text-slate-900 dark:text-white px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300 relative overflow-hidden">
      {/* Split-Screen Interactive Sliding Auth Card */}
      <div className="w-full mx-auto max-w-6xl rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0c0e17] shadow-lg min-h-[600px] relative overflow-hidden transition-all duration-500 animate-scale-in">
        
        {/* Sliding Editorial Branding Panel */}
        <div 
          className={`w-full lg:w-[42%] lg:h-full lg:absolute lg:top-0 lg:bottom-0 z-20 flex flex-col justify-between bg-[#0f172a] p-8 sm:p-12 lg:p-14 text-white transition-all duration-700 cubic-bezier(0.65, 0, 0.35, 1) ${
            isRegister 
              ? 'lg:left-full lg:-translate-x-full lg:border-l border-b lg:border-b-0 border-slate-800' 
              : 'lg:left-0 lg:translate-x-0 lg:border-r border-b lg:border-b-0 border-slate-800'
          }`}
        >
          <div className="space-y-8 relative z-10">
            <BrandLogo size="lg" variant="light" />
            
            <div className="space-y-3 pt-4">
              <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight leading-tight text-white">
                {isRegister ? 'Join the Community.' : 'The Future of Learning.'} <br />
                <span className="text-slate-300 font-semibold">
                  {isRegister ? 'Create Your Account.' : 'Starts Here.'}
                </span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {isRegister 
                  ? 'Start your journey as a student or instructor today with full access to interactive courses and certifications.'
                  : 'A deliberate environment where students learn, instructors teach, and achievements become verifiable credentials.'}
              </p>
            </div>
          </div>
          
          <div className="pt-8 relative z-10 flex items-center justify-between border-t border-white/10 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium"><HiOutlineAcademicCap className="text-slate-400" /> EduPlatform Academic Workspace</span>
            <span className="text-slate-500 font-mono text-[11px]">v2.0</span>
          </div>
        </div>

        {/* Form Container (Slides smoothly to opposite side) */}
        <div 
          className={`w-full lg:w-[58%] h-full p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-white dark:bg-transparent transition-all duration-700 cubic-bezier(0.65, 0, 0.35, 1) ${
            isRegister ? 'lg:mr-auto lg:ml-0' : 'lg:ml-auto lg:mr-0'
          }`}
        >
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;