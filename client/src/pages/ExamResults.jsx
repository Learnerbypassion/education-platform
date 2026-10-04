import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getExamResults } from '../api/examApi';
import Loader from '../components/common/Loader';
import {
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi';

const formatDuration = (seconds) => {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${String(r).padStart(2, '0')}s` : `${r}s`;
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

/**
 * Shows a student's results / attempt history for a single exam.
 * Target of the "Exam Graded" notification (/exams/:id/results).
 */
const ExamResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getExamResults(id);
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load exam results.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    document.title = data?.exam?.title ? `${data.exam.title} – Results | EduPlatform` : 'Exam Results | EduPlatform';
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader text="Loading your results..." />
      </div>
    );
  }

  if (error || !data?.exam) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-3xl">⚠️</div>
        <h1 className="font-heading text-2xl font-black text-slate-900 dark:text-white">Results unavailable</h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{error || 'This exam could not be found.'}</p>
        <button
          id="exam-results-back-btn"
          onClick={() => navigate('/dashboard')}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700"
        >
          <HiOutlineArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  const { exam, submissions = [], attemptStatus } = data;
  const latest = submissions[0];
  const best = submissions.reduce((acc, s) => (!acc || s.score > acc.score ? s : acc), null);
  const hasPassed = submissions.some((s) => s.isPassed);
  const attemptsLeft = attemptStatus?.attemptsLeft ?? 0;
  const courseId = exam.courseId?._id || exam.courseId;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link
        to={courseId ? `/courses/${courseId}/learn` : '/dashboard'}
        id="exam-results-course-link"
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
      >
        <HiOutlineArrowLeft /> Back to course
      </Link>

      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
        <div className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl ${hasPassed ? 'bg-emerald-500/15' : 'bg-indigo-500/15'}`} />
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Exam Results</span>
        <h1 className="mt-1 font-heading text-3xl font-black tracking-tight text-slate-900 dark:text-white">{exam.title}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Passing score {exam.passingMarks} / {exam.totalMarks} • Duration {exam.duration} min
        </p>

        {latest ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Latest score</span>
              <span className="font-heading text-xl font-black text-slate-900 dark:text-white">{latest.score} / {latest.totalMarks}</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Best score</span>
              <span className="font-heading text-xl font-black text-slate-900 dark:text-white">{best?.percentage ?? 0}%</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Status</span>
              <span className={`inline-flex items-center gap-1.5 text-sm font-black uppercase ${hasPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {hasPassed ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />}
                {hasPassed ? 'Passed' : 'Not passed'}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Attempts</span>
              <span className="font-heading text-xl font-black text-slate-900 dark:text-white">
                {attemptStatus?.attemptsUsed ?? submissions.length} / {attemptStatus?.totalAllowedAttempts ?? exam.maxAttempts}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
            You haven&apos;t attempted this exam yet.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {attemptsLeft > 0 && exam.isPublished && (
            <Link
              to={`/exams/${exam._id}/take`}
              id="exam-results-retake-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:from-indigo-700 hover:to-purple-700 active:scale-95"
            >
              <HiOutlineRefresh /> {submissions.length > 0 ? `Retake exam (${attemptsLeft} left)` : 'Start exam'}
            </Link>
          )}
          {courseId && (
            <Link
              to={`/courses/${courseId}/learn`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              Go to course classroom
            </Link>
          )}
        </div>
      </header>

      {/* Attempt history */}
      {submissions.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-heading text-lg font-black text-slate-900 dark:text-white">Attempt history</h2>
          <ul className="space-y-3">
            {submissions.map((s) => (
              <li
                key={s._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]"
              >
                <div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">Attempt #{s.attemptNumber || 1}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                    <HiOutlineClock /> {formatDateTime(s.submittedAt)} • {formatDuration(s.timeSpent)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {s.score} / {s.totalMarks} <span className="text-slate-400">({s.percentage}%)</span>
                  </span>
                  <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    s.isPassed
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {s.isPassed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ExamResults;
