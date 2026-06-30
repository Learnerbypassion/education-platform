import { Outlet, Link } from 'react-router-dom';
import { FaGraduationCap } from 'react-icons/fa';

const AuthLayout = () => (
  <div className="min-h-screen bg-transparent px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:flex-row dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-1 flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-brand-50 p-8 text-slate-700 lg:p-12">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:shadow-md">
            <FaGraduationCap />
            <span>Edu<span className="font-semibold">Platform</span></span>
          </Link>
          <h1 className="mt-8 text-3xl font-semibold sm:text-4xl">Learn clearly. Assess simply. Certify confidently.</h1>
          <p className="mt-4 max-w-lg text-base text-slate-600">A lighter, more focused environment for instructors and students to move from course creation to achievement.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 transition hover:border-brand-300 hover:text-brand-700">Simple workflows</span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 transition hover:border-brand-300 hover:text-brand-700">Responsive by default</span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 transition hover:border-brand-300 hover:text-brand-700">Modern UI</span>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-10">
        <div className="w-full max-w-md animate-page-enter">
          <Outlet />
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
