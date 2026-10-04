import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HeroBackground from "../components/background/heroBackground";
import { 
  HiOutlineArrowRight, 
  HiOutlineSparkles, 
  HiOutlineBookOpen, 
  HiOutlineShieldCheck, 
  HiOutlineClock, 
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineChevronRight,
  HiOutlineChevronDown
} from 'react-icons/hi';
import { FaCertificate, FaGraduationCap, FaPlay } from 'react-icons/fa';
import './Home.css';

// Core Education Capabilities (Bento Grid Data)
const educationCapabilities = [
  {
    id: 'course-mgmt',
    tag: 'Course Engine',
    title: 'Structured Course Management',
    desc: 'Create and organize courses with structured modules, video materials, downloadable guides, and step-by-step progress tracking.',
    icon: <HiOutlineBookOpen className="text-2xl text-indigo-500" />,
    badge: 'Course Delivery',
    link: '/courses',
    linkText: 'Explore Courses',
    spanCols: 'lg:col-span-7',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    accentBorder: 'from-indigo-500 to-purple-600',
    widget: (
      <div className="mt-5 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>Interactive Course Modules</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/20">
          84% Progress ✓
        </span>
      </div>
    ),
  },
  {
    id: 'assignments',
    tag: 'Interactive Tasks',
    title: 'Assignment Submissions & Feedback',
    desc: 'Streamline assignment creation, student project submissions, score recording, and personalized instructor feedback.',
    icon: <HiOutlineClipboardList className="text-2xl text-rose-500" />,
    badge: 'Task Management',
    link: null,
    spanCols: 'lg:col-span-5',
    gradient: 'from-rose-500/20 via-amber-500/10 to-transparent',
    accentBorder: 'from-rose-500 to-amber-500',
    widget: (
      <div className="mt-5 p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-500/20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold text-rose-950 dark:text-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>Submission Ledger</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-500/20 px-2.5 py-1 rounded-full border border-rose-500/20">
          3 Projects Graded 📤
        </span>
      </div>
    ),
  },
  {
    id: 'exams',
    tag: 'Assessments',
    title: 'Timed Online Exams & Question Pools',
    desc: 'Conduct secure online examinations with countdown timers, randomized question pools, and automated score calculation.',
    icon: <HiOutlineClock className="text-2xl text-amber-500" />,
    badge: 'Online Exams',
    link: null,
    spanCols: 'lg:col-span-5',
    gradient: 'from-amber-500/20 via-emerald-500/10 to-transparent',
    accentBorder: 'from-amber-500 to-emerald-500',
    widget: (
      <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-500/20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-950 dark:text-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Proctored Exam Console</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/20">
          ⏱️ Timed Session
        </span>
      </div>
    ),
  },
  {
    id: 'certificates',
    tag: 'Credentials',
    title: 'Verifiable Digital Certificates',
    desc: 'Issue official digital certificates with unique verification IDs that students and institutions can publicly authenticate.',
    icon: <HiOutlineShieldCheck className="text-2xl text-emerald-500" />,
    badge: 'Public Verification',
    link: '/verify',
    linkText: 'Verify Certificate',
    spanCols: 'lg:col-span-7',
    gradient: 'from-emerald-500/20 via-sky-500/10 to-transparent',
    accentBorder: 'from-emerald-500 to-teal-500',
    widget: (
      <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-950 dark:text-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Cryptographic ID Registry</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/20">
          🏅 Official Verified
        </span>
      </div>
    ),
  },
];

// Interactive Preview Tabs
const previewTabs = [
  { id: 'student', label: 'Student Workspace', icon: <HiOutlineAcademicCap /> },
  { id: 'instructor', label: 'Instructor Studio', icon: <HiOutlineUserGroup /> },
  { id: 'verifier', label: 'Verification Hub', icon: <HiOutlineShieldCheck /> },
];

// Education Platform FAQ
const faqItems = [
  {
    q: 'How does digital certificate verification work?',
    a: 'Every completed course generates a digital certificate containing a unique Certificate ID. Anyone can visit /verify and enter the ID to confirm student name, course title, completion date, and official issuance.',
  },
  {
    q: 'How are online exams timed and scored?',
    a: 'Exams feature real-time countdown timers and randomized question pools. Once submitted, questions are scored automatically by the assessment engine with instant results.',
  },
  {
    q: 'How do instructors manage assignments and feedback?',
    a: 'Instructors can create assignments with deadlines, attach instructions, review student submissions, assign scores, and provide detailed feedback notes.',
  },
  {
    q: 'What role-based features are supported?',
    a: 'EduPlatform supports Student, Instructor, and Admin roles. Students access learning portals, while instructors access course creation and grading studios.',
  },
];

const Home = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [heroTab, setHeroTab] = useState('studentView');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="home-page-root min-h-screen text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      <HeroBackground />

      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1300px] h-[550px] bg-gradient-to-r from-indigo-500/15 via-purple-500/12 to-rose-500/10 blur-[160px] -z-10 pointer-events-none opacity-80 dark:opacity-100 max-w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28 md:space-y-36 pt-6 sm:pt-10 pb-20 sm:pb-28 w-full min-w-0">

        {/* ══════════════════════════════════════════════════
           1. FULLSCREEN EDITORIAL HERO WITH EDUCATION WORKSPACE MOCKUP
           ══════════════════════════════════════════════════ */}
        <section className="relative z-10 pt-4 sm:pt-8 md:pt-16 pb-8 sm:pb-12 grid items-center gap-10 lg:gap-14 lg:grid-cols-12 animate-fade-in-up w-full min-w-0">
          
          {/* Left Column: Education Platform Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left w-full min-w-0">
            
            {/* Editorial Headline */}
            <h1 className="hero-editorial-heading">
              The Future of Learning <br />
              <span className="gradient-text">
                Starts Here.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-editorial-subtext max-w-xl mx-auto lg:mx-0">
              Experience a modern education platform where students can learn, instructors can teach, and achievements become verifiable credentials—all in one seamless experience.
            </p>

            {/* REAL CTA BUTTONS ONLY */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-5 pt-3 sm:pt-4">
              <Link 
                to="/courses" 
                className="px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 w-full sm:w-auto cursor-pointer"
              >
                <span>Explore Courses</span>
                <HiOutlineArrowRight className="text-sm sm:text-base" />
              </Link>

              <Link 
                to="/register" 
                className="px-6 py-3.5 sm:px-8 sm:py-4 bg-white dark:bg-white/10 text-indigo-950 dark:text-white border-2 border-indigo-200 dark:border-white/15 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-white/20 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 w-full sm:w-auto cursor-pointer"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] sm:text-xs">
                  <FaPlay size={10} />
                </div>
                <span>Get Started Free</span>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="pt-6 sm:pt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 border-t border-slate-200/80 dark:border-slate-800">
              <span className="flex items-center gap-1.5"><HiOutlineCheckCircle className="text-emerald-500 text-base flex-shrink-0" /> Course Modules</span>
              <span className="flex items-center gap-1.5"><HiOutlineCheckCircle className="text-emerald-500 text-base flex-shrink-0" /> Assignments & Exams</span>
              <span className="flex items-center gap-1.5"><HiOutlineCheckCircle className="text-emerald-500 text-base flex-shrink-0" /> Public Verification</span>
            </div>

          </div>

          {/* Right Column: Clean Central Polished Education Workspace Mockup */}
          <div className="lg:col-span-6 w-full relative min-w-0">
            
            {/* Ambient Soft Glow Mesh Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-pink-500/15 blur-3xl -z-10 rounded-full scale-95 transform translate-y-4" />

            <div className="bento-hero-dashboard border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0c0e17]/90 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-2xl p-4 sm:p-6 overflow-hidden transition-all duration-300 hover:border-indigo-500/40 w-full min-w-0">
              
              {/* Window Controls & Bar */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80 flex-shrink-0" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 flex-shrink-0" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 ml-1.5 truncate max-w-[120px] sm:max-w-none">eduplatform-workspace.json</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden min-[360px]:inline">Workspace </span>Active
                </span>
              </div>

              {/* View Switcher inside Mockup */}
              <div className="grid grid-cols-3 gap-1.5 mb-4 p-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/5 rounded-xl text-xs font-extrabold w-full">
                <button 
                  id="hero-tab-student"
                  type="button"
                  onClick={() => setHeroTab('studentView')}
                  className={`py-2 px-1 sm:px-3 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 touch-manipulation cursor-pointer text-[10px] sm:text-xs font-extrabold text-center truncate ${
                    heroTab === 'studentView' 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="sm:hidden">Student</span>
                  <span className="hidden sm:inline">Student Portal</span>
                </button>
                <button 
                  id="hero-tab-instructor"
                  type="button"
                  onClick={() => setHeroTab('instructorView')}
                  className={`py-2 px-1 sm:px-3 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 touch-manipulation cursor-pointer text-[10px] sm:text-xs font-extrabold text-center truncate ${
                    heroTab === 'instructorView' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="sm:hidden">Instructor</span>
                  <span className="hidden sm:inline">Instructor Studio</span>
                </button>
                <button 
                  id="hero-tab-verifier"
                  type="button"
                  onClick={() => setHeroTab('credentialView')}
                  className={`py-2 px-1 sm:px-3 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 touch-manipulation cursor-pointer text-[10px] sm:text-xs font-extrabold text-center truncate ${
                    heroTab === 'credentialView' 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="sm:hidden">Verifier</span>
                  <span className="hidden sm:inline">Certificate Hub</span>
                </button>
              </div>

              {/* Dynamic UI Content Views */}
              {heroTab === 'studentView' && (
                <div key="studentView" className="space-y-3 animate-fade-in text-left w-full min-w-0">
                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 min-w-0 transition-transform duration-200 active:scale-[0.99]">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="p-1.5 sm:p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 flex-shrink-0"><HiOutlineBookOpen className="text-base sm:text-xl" /></div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">Web Development Fundamentals</h5>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">Module 4: React Components & Hooks</p>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md flex-shrink-0">84% Progress</span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 min-w-0 transition-transform duration-200 active:scale-[0.99]">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="p-1.5 sm:p-2.5 rounded-lg bg-amber-500/10 text-amber-500 flex-shrink-0"><HiOutlineClock className="text-base sm:text-xl" /></div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">Proctored Midterm Examination</h5>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">Timed Online Assessment</p>
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md flex-shrink-0">Upcoming</span>
                  </div>
                </div>
              )}

              {heroTab === 'instructorView' && (
                <div key="instructorView" className="space-y-3 animate-fade-in text-left w-full min-w-0">
                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2 min-w-0 transition-transform duration-200 active:scale-[0.99]">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                      <span className="truncate">Course Management Studio</span>
                      <span className="font-mono text-[10px] sm:text-xs flex-shrink-0 ml-2">Draft Mode</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">Create course modules, upload video lectures, and set assignment guidelines.</p>
                  </div>
                </div>
              )}

              {heroTab === 'credentialView' && (
                <div key="credentialView" className="space-y-3 animate-fade-in text-left w-full min-w-0">
                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 min-w-0 transition-transform duration-200 active:scale-[0.99]">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <HiOutlineShieldCheck className="text-base flex-shrink-0" /> Public Credential Verifier
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Certificate ID: <span className="font-mono font-bold text-slate-900 dark:text-white">EDU-892X-CERT</span></p>
                    <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded">Official Credential Verified ✓</span>
                  </div>
                </div>
              )}

              {/* Bottom UI Bar */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-center min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Certificates</span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1 truncate">
                    <FaCertificate className="text-amber-500 text-xs flex-shrink-0" /> <span className="truncate">Verifiable Credentials</span>
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-center min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5 truncate">Platform Access</span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1 truncate">
                    <FaGraduationCap className="text-xs flex-shrink-0" /> <span className="truncate">Student & Instructor</span>
                  </span>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* ══════════════════════════════════════════════════
           2. CORE PLATFORM CAPABILITIES (BENTO MATRIX)
           ══════════════════════════════════════════════════ */}
        <section className="space-y-8 sm:space-y-12">
          
          <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto px-2">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              Designed for seamless education
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400">
              A cohesive environment equipped with all the essential tools for creators, teachers, and students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            {educationCapabilities.map((feat) => (
              <div 
                key={feat.id} 
                className={`bento-card ${feat.spanCols} p-5 sm:p-7 md:p-10 relative flex flex-col justify-between overflow-hidden group rounded-2xl sm:rounded-3xl lg:rounded-[2.25rem] transition-all duration-300 active:scale-[0.99] touch-manipulation border border-slate-200/90 dark:border-white/10 hover:border-indigo-500/40`}
              >
                {/* Top Accent Gradient Border Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feat.accentBorder} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Subtle Ambient Hover Mesh Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-md flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-indigo-500/20 transition-all duration-300">
                      {feat.icon}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md shadow-sm">
                      {feat.badge}
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-2">{feat.tag}</span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 sm:mb-3 font-heading tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{feat.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-medium">{feat.desc}</p>
                  
                  {/* Interactive Visual Preview Widget */}
                  {feat.widget}
                </div>

                {feat.link && (
                  <div className="pt-5 sm:pt-6 relative z-10">
                    <Link to={feat.link} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-xs font-extrabold text-indigo-600 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white active:scale-95 touch-manipulation transition-all duration-200 shadow-sm">
                      <span>{feat.linkText}</span>
                      <HiOutlineArrowRight className="text-sm transform group-hover:translate-x-1.5 transition-transform duration-200" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>

        {/* ══════════════════════════════════════════════════
           3. INSTRUCTOR CONVERSION STUDIO (PREMIUM SPLIT SECTION)
           ══════════════════════════════════════════════════ */}
        <section className="relative w-full min-w-0">
          <div className="rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-[#0a0c1a] to-indigo-950/90 p-5 sm:p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden backdrop-blur-2xl grid items-center gap-8 lg:gap-12 lg:grid-cols-12 w-full min-w-0">
            
            {/* Ambient Background Radial Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Conversion Copy & Action */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left relative z-10 w-full min-w-0">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight leading-tight break-words">
                Empower learners. <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Publish your expertise.
                </span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-medium">
                Join a unified learning platform designed for educators. Build structured course modules, manage assignments, conduct proctored online exams, and issue verifiable digital credentials.
              </p>

              <div className="space-y-3 pt-2 text-xs sm:text-sm font-bold text-slate-200">
                <div className="flex items-start sm:items-center gap-2.5">
                  <HiOutlineCheckCircle className="text-emerald-400 text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="min-w-0 flex-1 leading-snug">Full Course Delivery & Curriculum Builder</span>
                </div>
                <div className="flex items-start sm:items-center gap-2.5">
                  <HiOutlineCheckCircle className="text-emerald-400 text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="min-w-0 flex-1 leading-snug">Automated Online Exam Scoring & Question Pools</span>
                </div>
                <div className="flex items-start sm:items-center gap-2.5">
                  <HiOutlineCheckCircle className="text-emerald-400 text-base sm:text-lg flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="min-w-0 flex-1 leading-snug">1-Click Public Certificate Verification</span>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4">
                <Link 
                  to="/register" 
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 w-full sm:w-auto cursor-pointer"
                >
                  <span>Become an Instructor</span>
                  <HiOutlineArrowRight className="text-sm sm:text-base" />
                </Link>
                <Link 
                  to="/courses" 
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 w-full sm:w-auto cursor-pointer backdrop-blur-md"
                >
                  <span>Explore Existing Courses</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Instructor Studio Mockup Visual Console */}
            <div className="lg:col-span-6 w-full relative z-10 min-w-0">
              <div className="rounded-2xl sm:rounded-3xl border border-white/15 bg-slate-950/90 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-4 hover:border-purple-500/40 transition-all duration-300 w-full min-w-0">
                
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs gap-2">
                  <div className="flex items-center gap-2 sm:gap-2.5 font-mono text-slate-300 font-bold min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping flex-shrink-0" />
                    <span className="truncate max-w-[130px] sm:max-w-none">Instructor Studio Live</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-500/30 shadow-sm flex-shrink-0">
                    ● Active
                  </span>
                </div>

                {/* Studio UI Cards */}
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:translate-x-1.5 transition-all duration-200 min-w-0 gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex-shrink-0">
                        <HiOutlineBookOpen className="text-lg sm:text-xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-extrabold text-white truncate">Full-Stack Web Engineering</h5>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">4 Modules Published • 12 Video Lessons</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-500/30 flex-shrink-0">Active 🟢</span>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:translate-x-1.5 transition-all duration-200 min-w-0 gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                        <HiOutlineClock className="text-lg sm:text-xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-extrabold text-white truncate">Proctored Online Midterm Exam</h5>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Timed Assessment • Auto-Scored</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-amber-500/30 flex-shrink-0">Ready ⏱️</span>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:translate-x-1.5 transition-all duration-200 min-w-0 gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                        <HiOutlineShieldCheck className="text-lg sm:text-xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-extrabold text-white truncate">Digital Certificate Issuance</h5>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Cryptographic ID Verification</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-500/30 flex-shrink-0">Enabled 🏅</span>
                  </div>
                </div>

                {/* Bottom Live Metrics Bar */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-3 border-t border-slate-800/80 text-center w-full min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 border border-slate-800 min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Students</span>
                    <strong className="text-xs sm:text-sm font-black text-white truncate block">1,420+</strong>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 border border-slate-800 min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Completion</span>
                    <strong className="text-xs sm:text-sm font-black text-emerald-400 truncate block">96%</strong>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 border border-slate-800 min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">Rating</span>
                    <strong className="text-xs sm:text-sm font-black text-amber-400 truncate block">4.9 ★</strong>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════
           4. WORKFLOW TIMELINE (ANIMATED 4-STEP CARDS)
           ══════════════════════════════════════════════════ */}
        <section className="space-y-8 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto px-2">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
              How the Platform Works
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
              4 simple steps to master skills, complete proctored exams, and earn verified credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Step 1 */}
            <div className="bento-card p-5 sm:p-7 relative flex flex-col justify-between overflow-hidden group rounded-2xl sm:rounded-3xl transition-all duration-500 hover:-translate-y-2.5 hover:shadow-2xl border border-slate-200/90 dark:border-white/10 hover:border-indigo-500/40">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg sm:text-xl font-black shadow-sm group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                    <HiOutlineBookOpen />
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-indigo-500/30 group-hover:text-indigo-500 transition-colors">01</span>
                </div>
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">Step 1</span>
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white font-heading group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Explore & Enroll
                  </h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Browse published courses across various subjects and enroll to start your learning path.
                </p>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Course Discovery</span>
                <span className="text-indigo-500 font-mono">→ Step 2</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bento-card p-5 sm:p-7 relative flex flex-col justify-between overflow-hidden group rounded-2xl sm:rounded-3xl transition-all duration-500 hover:-translate-y-2.5 hover:shadow-2xl border border-slate-200/90 dark:border-white/10 hover:border-purple-500/40">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg sm:text-xl font-black shadow-sm group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                    <HiOutlineClipboardList />
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-purple-500/30 group-hover:text-purple-500 transition-colors">02</span>
                </div>
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 block mb-1">Step 2</span>
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white font-heading group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Complete Coursework
                  </h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Progress through course modules, watch video materials, and submit assigned projects.
                </p>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Interactive Learning</span>
                <span className="text-purple-500 font-mono">→ Step 3</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bento-card p-5 sm:p-7 relative flex flex-col justify-between overflow-hidden group rounded-2xl sm:rounded-3xl transition-all duration-500 hover:-translate-y-2.5 hover:shadow-2xl border border-slate-200/90 dark:border-white/10 hover:border-amber-500/40">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg sm:text-xl font-black shadow-sm group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                    <HiOutlineClock />
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-500/30 group-hover:text-amber-500 transition-colors">03</span>
                </div>
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">Step 3</span>
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white font-heading group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Take Timed Exams
                  </h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Demonstrate subject mastery through proctored online examinations with instant results.
                </p>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Online Assessment</span>
                <span className="text-amber-500 font-mono">→ Step 4</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bento-card p-5 sm:p-7 relative flex flex-col justify-between overflow-hidden group rounded-2xl sm:rounded-3xl transition-all duration-500 hover:-translate-y-2.5 hover:shadow-2xl border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg sm:text-xl font-black shadow-sm group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                    <HiOutlineShieldCheck />
                  </div>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-500/30 group-hover:text-emerald-500 transition-colors">04</span>
                </div>
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">Step 4</span>
                  <h4 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white font-heading group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Earn & Verify Certificate
                  </h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Receive your digital certificate upon completion and share your public verification link.
                </p>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>Credential Verified</span>
                <span className="text-emerald-500 font-mono">✓ Verified</span>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════
           5. INTERACTIVE WORKSPACE PREVIEW
           ══════════════════════════════════════════════════ */}
        <section className="space-y-6 sm:space-y-8">
          <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto px-2">
            <span className="badge badge-info text-[10px] sm:text-xs">Interactive Experience</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              Preview the Unified Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Switch between roles to experience how EduPlatform adapts to students, instructors, and verifiers.
            </p>
          </div>

          {/* Role Tab Selector */}
          <div className="flex flex-col sm:flex-row justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner w-full min-w-0">
            {previewTabs.map((tab) => (
              <button
                key={tab.id}
                id={`workspace-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 touch-manipulation cursor-pointer flex-1 min-w-0 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                <span className="text-sm flex-shrink-0">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Preview Tab View Container */}
          <div className="bento-hero-dashboard border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0c0e17]/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 max-w-4xl mx-auto shadow-2xl backdrop-blur-2xl w-full min-w-0">
            {activeTab === 'student' && (
              <div key="student" className="w-full space-y-5 sm:space-y-6 animate-fade-in text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-indigo-500 uppercase tracking-widest">Student Portal</span>
                    <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white font-heading leading-snug">Course Dashboard & Learning Track</h3>
                  </div>
                  <Link to="/courses" className="btn-primary btn-sm self-start sm:self-auto text-xs flex-shrink-0">Browse All Courses</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">MODULE 1</span>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">Web Architecture</h5>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-4/5 h-full bg-indigo-500 rounded-full" />
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">MODULE 2</span>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">API Integration</h5>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-3/5 h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">ASSESSMENT</span>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">Midterm Exam</h5>
                    <span className="inline-block text-[10px] sm:text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Timed Session</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div key="instructor" className="w-full space-y-5 sm:space-y-6 animate-fade-in text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-purple-500 uppercase tracking-widest">Instructor Studio</span>
                    <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white font-heading leading-snug">Course Building & Grading Hub</h3>
                  </div>
                  <Link to="/register" className="btn-primary btn-sm self-start sm:self-auto text-xs flex-shrink-0">Instructor Sign Up</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <HiOutlineBookOpen className="text-purple-500 flex-shrink-0" /> Create New Course
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Draft modules, upload video lectures, and set assignment guidelines.</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <HiOutlineCheckCircle className="text-emerald-500 flex-shrink-0" /> Grade Submissions
                    </h5>
                    <p className="text-xs text-slate-500 leading-relaxed">Review student work, assign scores, and provide feedback.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verifier' && (
              <div key="verifier" className="w-full space-y-5 sm:space-y-6 animate-fade-in text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-widest">Certificate Verification</span>
                    <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white font-heading leading-snug">Public Credential Authenticator</h3>
                  </div>
                  <Link to="/verify" className="btn-primary btn-sm self-start sm:self-auto text-xs flex-shrink-0">Open Verifier</Link>
                </div>
                <div className="p-4 sm:p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-2.5 sm:space-y-3">
                  <HiOutlineShieldCheck className="text-3xl sm:text-4xl text-emerald-500 mx-auto" />
                  <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Instant 1-Click Verification Portal</h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Enter any Certificate ID to confirm recipient name, course title, completion timestamp, and cryptographic signature.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
           6. HIGH-CONTRAST PREMIUM CTA BLOCK
           ══════════════════════════════════════════════════ */}
        <section className="w-full min-w-0">
          <div className="rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-[#0a0c1a] to-indigo-950 p-6 sm:p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden backdrop-blur-2xl w-full min-w-0">
            
            {/* Ambient Animated Radial Meshes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse delay-2" />

            <div className="relative z-10 space-y-6 sm:space-y-8 max-w-3xl mx-auto w-full min-w-0">
              <h2 className="text-xl sm:text-4xl md:text-6xl font-black font-heading tracking-tight leading-tight break-words">
                Transform Your Skills. <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Accelerate Your Future.
                </span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-base md:text-lg leading-relaxed font-medium max-w-2xl mx-auto">
                Join thousands of learners, educators, and verifiers on EduPlatform. Master in-demand skills, complete proctored online exams, and showcase verifiable digital credentials.
              </p>

              {/* Action Metric Feature Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[11px] sm:text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 sm:gap-2"><HiOutlineCheckCircle className="text-emerald-400 text-base sm:text-lg flex-shrink-0" /> 100% Free Registration</span>
                <span className="flex items-center gap-1.5 sm:gap-2"><HiOutlineCheckCircle className="text-emerald-400 text-base sm:text-lg flex-shrink-0" /> Instant Public Verification</span>
                <span className="flex items-center gap-1.5 sm:gap-2"><HiOutlineCheckCircle className="text-emerald-400 text-base sm:text-lg flex-shrink-0" /> Proctored Assessment Engine</span>
              </div>

              <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5">
                <Link 
                  to="/register" 
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:scale-95 touch-manipulation transition-all duration-200 flex items-center justify-center gap-2.5 w-full sm:w-auto cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <HiOutlineArrowRight size={18} />
                </Link>
                <Link 
                  to="/verify" 
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 hover:border-white/40 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 touch-manipulation transition-all duration-200 flex items-center justify-center gap-2.5 w-full sm:w-auto cursor-pointer backdrop-blur-md"
                >
                  <HiOutlineShieldCheck className="text-emerald-400 text-base sm:text-lg flex-shrink-0" />
                  <span>Verify Certificate</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════
           7. FREQUENTLY ASKED QUESTIONS (FAQ)
           ══════════════════════════════════════════════════ */}
        <section className="space-y-6 sm:space-y-10 pt-2 sm:pt-4">
          <div className="text-center space-y-2 sm:space-y-3 max-w-2xl mx-auto px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bento-card overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer rounded-xl sm:rounded-2xl active:scale-[0.99] touch-manipulation"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <button
                    type="button"
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-slate-900 dark:text-white text-left transition-colors duration-200 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="min-w-0 flex-1 leading-snug">{item.q}</span>
                    <HiOutlineChevronDown className={`text-base sm:text-lg text-indigo-500 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div 
                    className={`grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-800/80 pt-3">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;