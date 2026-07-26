import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/common/BrandLogo';
import { HiOutlineCheckCircle, HiOutlineAcademicCap, HiOutlineShieldCheck } from 'react-icons/hi';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07080a] text-slate-900 dark:text-white px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center transition-colors duration-300 relative overflow-hidden">
      
      {/* Animated Ambient Glowing Radial Meshes */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-pink-500/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-emerald-500/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse delay-2" />

      {/* Floating Animated Ambient Particles */}
      <div className="absolute top-12 left-20 w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md animate-float pointer-events-none -z-5" />
      <div className="absolute bottom-16 right-20 w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md animate-float delay-3 pointer-events-none -z-5" />

      {/* Split-Screen Glassmorphic Interactive Sliding Auth Card */}
      <div className="w-full mx-auto max-w-6xl rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 bg-white/85 dark:bg-[#0c0e17]/85 shadow-2xl backdrop-blur-2xl min-h-[640px] relative overflow-hidden transition-all duration-500 animate-scale-in">
        
        {/* Sliding Editorial Branding Panel */}
        <div 
          className={`w-full lg:w-[42%] lg:h-full lg:absolute lg:top-0 lg:bottom-0 z-20 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-[#0a0c16] to-indigo-950 p-8 sm:p-12 lg:p-14 text-white transition-all duration-700 cubic-bezier(0.65, 0, 0.35, 1) ${
            isRegister 
              ? 'lg:left-full lg:-translate-x-full lg:border-l border-b lg:border-b-0 border-slate-800' 
              : 'lg:left-0 lg:translate-x-0 lg:border-r border-b lg:border-b-0 border-slate-800'
          }`}
        >
          {/* Ambient Background Radial Circle */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            <BrandLogo size="lg" variant="light" />
            
            <div className="space-y-3 pt-2">
              <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight leading-tight">
                {isRegister ? 'Join the Community' : 'The Future of Learning'} <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  {isRegister ? 'Create Your Account.' : 'Starts Here.'}
                </span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {isRegister 
                  ? 'Start your journey as a student or instructor today with full access to interactive courses and certifications.'
                  : 'A modern environment where students learn, instructors teach, and achievements become verifiable credentials.'}
              </p>
            </div>

            <div className="space-y-3.5 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2.5 hover:translate-x-1 transition-transform duration-200">
                <HiOutlineCheckCircle className="text-emerald-400 text-base flex-shrink-0" />
                <span>Structured Course Modules & Video Streaming</span>
              </div>
              <div className="flex items-center gap-2.5 hover:translate-x-1 transition-transform duration-200">
                <HiOutlineCheckCircle className="text-emerald-400 text-base flex-shrink-0" />
                <span>Proctored Online Exams & Instant Scoring</span>
              </div>
              <div className="flex items-center gap-2.5 hover:translate-x-1 transition-transform duration-200">
                <HiOutlineCheckCircle className="text-emerald-400 text-base flex-shrink-0" />
                <span>1-Click Public Certificate Verification</span>
              </div>
            </div>
          </div>
          
          <div className="pt-10 relative z-10 flex items-center justify-between border-t border-white/10 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold"><HiOutlineAcademicCap className="text-indigo-400" /> EduPlatform Engine v2.4</span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-400"><HiOutlineShieldCheck className="text-base" /> SSL Encrypted</span>
          </div>
        </div>

        {/* Form Container (Slides smoothly to opposite side) */}
        <div 
          className={`w-full lg:w-[58%] h-full p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-white/40 dark:bg-transparent transition-all duration-700 cubic-bezier(0.65, 0, 0.35, 1) ${
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