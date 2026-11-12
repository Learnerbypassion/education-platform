import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getExamResults, getExam } from '../api/examApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import {
  HiOutlineAcademicCap,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { formatDate } from '../utils/helpers';
import './ExamResult.css';

const ExamResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const [submissionsRes, examRes] = await Promise.all([
        getExamResults(id).catch(err => {
          console.warn('Failed to fetch exam results submissions:', err);
          return { data: { data: [] } };
        }),
        getExam(id).catch(err => {
          console.warn('Failed to fetch exam info:', err);
          return { data: { data: null } };
        }),
      ]);

      const subs = submissionsRes.data?.data || [];
      const examData = examRes.data?.data || null;

      setSubmissions(subs);
      setExam(examData);

      if (subs.length === 0 && !examData) {
        setError('No examination or submission record was found for this assessment.');
      }
    } catch (err) {
      console.error('Error fetching exam results:', err);
      setError(err.response?.data?.message || 'Unable to retrieve exam results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchResults();
    }
  }, [id]);

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Loading examination performance report..." />
      </div>
    );
  }

  const latestSubmission = submissions && submissions.length > 0 ? submissions[0] : null;

  // If no submissions exist or an error occurred
  if (!latestSubmission) {
    return (
      <div className="exam-result-page">
        <div className="exam-result-nav">
          <button
            onClick={() => {
              if (exam?.courseId) navigate(`/courses/${exam.courseId}/learn`);
              else navigate('/dashboard');
            }}
            className="exam-result-back-btn"
          >
            <HiOutlineArrowLeft size={16} /> Back to Course
          </button>
        </div>

        <div className="exam-result-hero-card max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/20">
            <HiOutlineExclamationCircle size={36} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight mb-2">
            Assessment Result Unavailable
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium">
            {error || 'No recorded exam submissions were found for this assessment. You may not have completed this test yet or your evaluation is pending.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {exam ? (
              <Link
                to={`/exams/${id}/take`}
                className="btn-detail-primary px-6 py-3 font-extrabold text-xs"
              >
                <span>Take Assessment Now</span>
                <HiOutlineArrowRight size={16} />
              </Link>
            ) : null}

            {exam?.courseId ? (
              <Link
                to={`/courses/${exam.courseId}/learn`}
                className="btn btn-outline py-3 px-6 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Go to Classroom</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="btn btn-outline py-3 px-6 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Return to Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isPassed = latestSubmission.isPassed;
  const score = latestSubmission.score || 0;
  const totalMarks = latestSubmission.totalMarks || exam?.totalMarks || 0;
  const percentage = latestSubmission.percentage || (totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0);
  const courseId = exam?.courseId || latestSubmission.courseId;

  return (
    <div className="exam-result-page">
      {/* Top Navigation */}
      <div className="exam-result-nav">
        <button
          onClick={() => {
            if (courseId) navigate(`/courses/${courseId}/learn`);
            else navigate('/dashboard');
          }}
          className="exam-result-back-btn"
        >
          <HiOutlineArrowLeft size={16} /> Back to Course Classroom
        </button>

        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Performance Report
        </span>
      </div>

      {/* Main Score Card */}
      <div className={`exam-result-hero-card ${isPassed ? 'passed' : 'failed'} animate-scale-in`}>
        {/* Glow Element */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
          isPassed ? 'bg-emerald-500/15' : 'bg-rose-500/15'
        }`} />

        {/* Status Icon */}
        <div className="exam-result-trophy mx-auto mb-4">
          {isPassed ? (
            <HiOutlineCheckCircle size={40} className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <HiOutlineExclamationCircle size={40} className="text-rose-600 dark:text-rose-400" />
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {exam?.title || 'Examination Assessment'}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
          {isPassed
            ? 'Passing score requirements satisfied. Performance recorded in the academic registry.'
            : 'Evaluation complete. Performance recorded in the course assessment ledger.'}
        </p>

        {/* Score Banner */}
        <div className="exam-result-score-banner my-6">
          <span className="text-5xl font-bold text-slate-900 dark:text-white">
            {percentage}%
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mt-1">
            Overall Score
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="exam-result-metric-grid">
          <div className="exam-result-metric-card">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Marks Secured
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-heading">
              {score} / {totalMarks}
            </span>
          </div>

          <div className="exam-result-metric-card">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Result Status
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
              isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {isPassed ? 'Passed' : 'Failed'}
            </span>
          </div>

          <div className="exam-result-metric-card">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Attempt Number
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-heading">
              #{latestSubmission.attemptNumber || 1}
            </span>
          </div>

          <div className="exam-result-metric-card">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Time Spent
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-heading">
              {formatDuration(latestSubmission.timeSpent)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {courseId && (
            <Link
              to={`/courses/${courseId}/learn`}
              className="btn-detail-primary py-3.5 px-6 font-extrabold text-xs shadow-lg"
            >
              <span>Back to Course Classroom</span>
              <HiOutlineArrowRight size={16} />
            </Link>
          )}

          <Link
            to={`/exams/${id}/take`}
            className="btn btn-outline py-3 px-6 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <HiOutlineRefresh size={16} />
            <span>Retake Assessment</span>
          </Link>

          <Link
            to="/dashboard"
            className="btn btn-outline py-3 px-6 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Attempt History Section (if > 1 submission) */}
      {submissions.length > 1 && (
        <div className="exam-result-history-section">
          <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading mb-4 flex items-center gap-2">
            <span>Attempt History</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold">
              {submissions.length} attempts recorded
            </span>
          </h3>

          <div className="flex flex-col gap-2.5">
            {submissions.map((sub, idx) => (
              <div key={sub._id || idx} className="exam-result-history-item">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    Attempt #{sub.attemptNumber || submissions.length - idx}
                  </span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    sub.isPassed
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {sub.isPassed ? 'Passed' : 'Failed'}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                      Latest
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Score: {sub.score} / {sub.totalMarks || totalMarks} ({sub.percentage}%)</span>
                  <span>Time: {formatDuration(sub.timeSpent)}</span>
                  <span>{sub.submittedAt ? formatDate(sub.submittedAt) : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResult;
