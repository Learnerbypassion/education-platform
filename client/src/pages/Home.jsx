import { Link } from 'react-router-dom';
import { FaGraduationCap, FaRobot, FaShieldAlt, FaCertificate, FaChalkboardTeacher, FaUserGraduate, FaBookOpen } from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi';

const features = [
  { icon: <FaChalkboardTeacher />, title: 'Dynamic Course Creation', desc: 'Build structured lessons with a clean flow for weeks, topics, or daily plans.' },
  { icon: <FaRobot />, title: 'Smart Assessment', desc: 'Auto-grade quizzes and collect submissions with less manual work.' },
  { icon: <FaShieldAlt />, title: 'Reliable Exams', desc: 'Keep assessments secure with simple proctoring essentials and clear controls.' },
  { icon: <FaCertificate />, title: 'Instant Certificates', desc: 'Issue recognition the moment learners complete their journey.' },
  { icon: <FaUserGraduate />, title: 'Progress Tracking', desc: 'Follow learner activity and completion with easy-to-read summaries.' },
  { icon: <FaBookOpen />, title: 'Flexible Content', desc: 'Support videos, documents, and presentations in a single learning space.' },
];

const stats = [
  { value: '10K+', label: 'Courses' },
  { value: '100K+', label: 'Learners' },
  { value: '50K+', label: 'Certificates' },
  { value: '5K+', label: 'Instructors' },
];

const Home = () => {
  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8 animate-page-enter">
      <section className="mx-auto grid max-w-7xl items-center gap-12 glass-card p-8 md:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
        <div className="animate-fade-in-up">
          <span className="badge badge-primary text-sm px-4 py-1.5 mb-6">The smarter way to teach and learn</span>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white font-heading leading-tight">
            Learn brilliantly. <br />
            <span className="gradient-text">Assess simply.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
            Create polished courses, handle assessments, and issue certificates in one stunning workspace designed for modern learning.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/courses" className="btn btn-primary btn-lg justify-center sm:justify-start">Explore Courses <HiOutlineArrowRight /></Link>
            <Link to="/register" className="btn btn-outline btn-lg justify-center sm:justify-start">Become an Instructor</Link>
          </div>
        </div>
        <div className="animate-scale-in delay-2 rounded-[2rem] border border-slate-200/80 bg-slate-50/50 p-6 text-slate-700 shadow-glow dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 backdrop-blur-md">
          <div className="glass-card p-6 border-white/80 hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-brand-100 p-3.5 text-brand-600 shadow-[0_0_15px_rgba(107,122,255,0.3)] dark:bg-brand-900/60 dark:text-brand-300"><FaGraduationCap size={24} /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today&apos;s milestone</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white font-heading">Certificate ready</p>
                </div>
              </div>
              <span className="badge badge-success">Live</span>
            </div>
            <div className="mt-8 space-y-3 rounded-2xl bg-slate-50/60 p-5 dark:bg-slate-800/60">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                <span>Course Completion</span>
                <span className="text-brand-600 dark:text-brand-400">78%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-brand-500 to-brand-400 animate-shimmer" />
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50/60 p-5 dark:bg-slate-800/60 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active learners</p>
                <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-white font-heading">12,400</p>
              </div>
              <div className="rounded-2xl bg-slate-50/60 p-5 dark:bg-slate-800/60 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Assessments</p>
                <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-white font-heading">4,200</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl animate-slide-up delay-3">
        <div className="grid gap-6 glass-card p-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/50 p-6 text-center shadow-sm dark:bg-slate-800/50 hover-lift">
              <p className="text-4xl font-extrabold text-brand-600 dark:text-brand-400 font-heading">{item.value}</p>
              <p className="mt-2 text-sm font-medium text-slate-600 uppercase tracking-widest dark:text-slate-300">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl animate-slide-up delay-4">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white font-heading">Everything you need, brilliantly organized</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">From course creation to certification, the platform keeps your workflow focused and approachable.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="glass-card p-8 hover-lift hover-glow">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 text-2xl text-brand-600 shadow-sm dark:from-brand-900/80 dark:to-brand-800/50 dark:text-brand-300 mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">{feature.title}</h3>
              <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl mb-12 animate-slide-up delay-5">
        <div className="rounded-[2.5rem] border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 px-8 py-16 text-center text-white shadow-2xl dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15),transparent_50%)] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(107,122,255,0.15),transparent_50%)] pointer-events-none"></div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold font-heading relative z-10">Ready to launch your next course?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300 relative z-10">Join the growing learning experience that keeps things brilliant for students and instructors.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 relative z-10">
            <Link to="/register" className="btn btn-lg bg-white text-slate-900 hover:bg-brand-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]">Get Started Free</Link>
            <Link to="/verify" className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">Verify Certificate</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
