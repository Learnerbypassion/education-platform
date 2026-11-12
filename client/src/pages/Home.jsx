import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBackground from '../components/background/heroBackground';
import {
  HiOutlineArrowRight,
  HiOutlineChevronDown
} from 'react-icons/hi';
import './Home.css';

// Educational Platform Architecture Pillars (3 Concise Highlights)
const platformPillars = [
  {
    index: '01',
    title: 'Curriculum & Course Delivery',
    desc: 'Structured modules supporting sequential lesson flows, high-definition video streaming, supplemental reading materials, and real-time curriculum progress tracking.',
    href: '/courses',
    actionText: 'Browse Course Catalog',
  },
  {
    index: '02',
    title: 'Timed Assessment & Examination Engine',
    desc: 'Rigorous online evaluations featuring configurable countdown timers, multi-format question pools, automatic instant scoring, and instructor retake governance.',
    href: '/courses',
    actionText: 'Explore Assessments',
  },
  {
    index: '03',
    title: 'Public Credential Verification Registry',
    desc: 'Official completion certificates equipped with unique verification IDs that universities, employers, and students can independently authenticate without logging in.',
    href: '/verify',
    actionText: 'Open Verification Portal',
  },
];

// Academic Progression Lifecycle (4 Steps)
const academicSteps = [
  {
    step: '01',
    title: 'Enrollment',
    desc: 'Browse published courses across technical domains and register for immediate curriculum workspace access.',
  },
  {
    step: '02',
    title: 'Curriculum Study',
    desc: 'Work through structured lessons, follow technical video lectures, and submit coursework assignments for review.',
  },
  {
    step: '03',
    title: 'Timed Assessment',
    desc: 'Complete proctored examinations under strict time limits with automatic scoring and detailed question reviews.',
  },
  {
    step: '04',
    title: 'Verified Credential',
    desc: 'Generate an official completion certificate with a persistent verification ID shareable on professional portfolios.',
  },
];

// Authentic Platform FAQ
const faqList = [
  {
    q: 'How does digital certificate verification work on EduPlatform?',
    a: 'Every student who completes all required course modules and passes the final assessment receives an official digital certificate with a unique alphanumeric credential ID. Anyone—such as an employer, recruiter, or academic institution—can visit the public verification portal (/verify), enter the ID, and instantly confirm recipient identity, course title, and completion date directly from our database.',
  },
  {
    q: 'How are online exams structured and timed?',
    a: 'Instructors configure exams with precise time limits, passing thresholds, and question pools. When a student begins an exam, a synchronized countdown timer starts. Upon submission, automated questions are scored immediately, with full scorecards and attempt history preserved in the student dashboard.',
  },
  {
    q: 'How do instructors manage assignments and grade submissions?',
    a: 'Instructors attach project briefs, rubric guidelines, and deadlines to specific course modules. Enrolled students submit their work through file uploads or external repository links. Instructors then evaluate submissions, award marks, and provide written feedback through the grading dashboard.',
  },
  {
    q: 'What role permissions exist within the platform?',
    a: 'EduPlatform enforces role-based access control for Students, Instructors, and Administrators. Students enroll in coursework and take exams. Instructors author courses, build examinations, and grade submissions. Administrators oversee platform health, user moderation, and system records.',
  },
];

const Home = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="home-root min-h-screen text-slate-900 dark:text-white relative">
      <HeroBackground />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-12 md:pt-16 pb-20 sm:pb-32">

        {/* ══════════════════════════════════════════════════
           1. REFERENCE-MATCHED EDITORIAL HERO SECTION
           ══════════════════════════════════════════════════ */}
        <section className="hero-card-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

            {/* Left Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 relative z-10">

              {/* Editorial Headline */}
              <h1 className="anim-hero-title hero-heading text-[1.65rem] xs:text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight leading-[1.18] text-slate-900 dark:text-white break-words">
                A deliberate system for structured learning and verified mastery.
              </h1>

              {/* Supporting Description */}
              <p className="anim-hero-desc hero-subheading text-sm sm:text-base text-slate-700 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
                EduPlatform unifies course curriculum delivery, timed proctored examinations, assignment grading, and publicly verifiable digital credentials into a cohesive academic workspace.
              </p>

              {/* Action CTA Buttons */}
              <div className="anim-hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  to="/courses"
                  className="hero-btn-primary px-6 py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 text-center shadow-sm"
                >
                  <span>Explore Course Catalog</span>
                  <HiOutlineArrowRight size={16} />
                </Link>
              </div>

            </div>

            {/* Right Column: Genuine Student Photograph with Organic Yellow Shape */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div className="hero-student-wrapper">

                {/* Decorative Yellow Squiggle (Top-Left) */}
                <svg
                  className="hero-deco-squiggle"
                  viewBox="0 0 52 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M2 7C6 2 10 2 14 7C18 12 22 12 26 7C30 2 34 2 38 7C42 12 46 12 50 7"
                    stroke="#F59E0B"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Large Organic Yellow/Amber Backdrop Blob */}
                <div className="hero-organic-blob" aria-hidden="true" />

                {/* Decorative Dot Matrix Pattern (Bottom-Right) */}
                <div className="hero-deco-dots" aria-hidden="true">
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    ))}
                  </div>
                </div>

                {/* Decorative Accent Ring */}
                <div className="hero-deco-accent" aria-hidden="true" />

                {/* Student Photo Card Frame */}
                <div className="hero-student-frame">
                  <img
                    src="/images/student-hero-portrait.jpg"
                    alt="Student holding study literature on campus"
                    className="hero-student-image"
                    loading="eager"
                    width="600"
                    height="827"
                  />
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════
           2. THREE CONCISE FEATURE HIGHLIGHTS
           ══════════════════════════════════════════════════ */}
        <section className="mt-20 sm:mt-28 pt-10 border-t border-slate-200 dark:border-slate-800">

          <div className="max-w-xl mb-10">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Core Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Engineered for genuine academic rigor.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platformPillars.map((pillar) => (
              <div key={pillar.index} className="pillar-card flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold text-slate-400">{pillar.index}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
                <div className="pt-6">
                  <Link
                    to={pillar.href}
                    className="text-xs font-semibold text-slate-900 dark:text-white hover:underline flex items-center gap-1.5 group"
                  >
                    <span>{pillar.actionText}</span>
                    <HiOutlineArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ══════════════════════════════════════════════════
           3. SIMPLE ACADEMIC WORKFLOW (4 STEPS)
           ══════════════════════════════════════════════════ */}
        <section className="mt-20 sm:mt-28 pt-10 border-t border-slate-200 dark:border-slate-800">

          <div className="max-w-xl mb-10">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Academic Process</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              How coursework leads to verified certification.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {academicSteps.map((s) => (
              <div key={s.step} className="workflow-step-card space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400">Step {s.step}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

        </section>

        {/* ══════════════════════════════════════════════════
           4. FREQUENTLY ASKED QUESTIONS (CENTERED)
           ══════════════════════════════════════════════════ */}
        <section className="mt-20 sm:mt-28 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center">

          <div className="max-w-xl mb-10 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Platform Information</span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Frequently asked questions.
            </h2>
          </div>

          <div className="space-y-3 w-full max-w-3xl mx-auto">
            {faqList.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="faq-item">
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <HiOutlineChevronDown
                      size={18}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-3">
                        {item.a}
                      </p>
                    </div>
                  )}
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
