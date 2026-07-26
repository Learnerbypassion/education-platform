import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { takeExam, submitExam } from '../api/examApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { 
  HiOutlineClock, 
  HiOutlineExclamationCircle, 
  HiOutlineShieldCheck, 
  HiOutlineInformationCircle, 
  HiCheck, 
  HiChevronLeft, 
  HiChevronRight, 
  HiArrowLeft,
  HiOutlineArrowRight
} from 'react-icons/hi';
import './ExamTake.css';

const ExamTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption / selectedOptions / textAnswer }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  // Custom Redesign UI States
  const [showInstructions, setShowInstructions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const timerRef = useRef(null);
  const endTimeRef = useRef(null);

  // Tab switch proctoring logic (Module 7 stub)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const next = prev + 1;
          toast.error(`Warning: Tab switch detected! Violations: ${next}/3`);
          if (next >= 3) {
            toast.error('Too many violations. Auto-submitting exam.');
            handleSubmit(true);
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [questions, answers]);

  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await takeExam(id);
        const { exam: examData, questions: qList } = res.data.data;
        setExam(examData);
        setQuestions(qList);

        const durationMinutes = Number(examData.duration) || 30;
        const totalSeconds = durationMinutes * 60;
        
        // Calculate absolute end target time
        endTimeRef.current = Date.now() + totalSeconds * 1000;
        setTimeLeft(totalSeconds);

        // Prepopulate empty answers
        const initial = {};
        qList.forEach(q => {
          if (q.type === 'multiple-correct') initial[q._id] = [];
          else initial[q._id] = '';
        });
        setAnswers(initial);

        if (timerRef.current) clearInterval(timerRef.current);

        // High precision interval tied to Date.now()
        timerRef.current = setInterval(() => {
          if (!endTimeRef.current) return;
          const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
          setTimeLeft(remaining);

          if (remaining <= 0) {
            clearInterval(timerRef.current);
            toast.error('Time is up! Submitting exam.');
            handleSubmit(true);
          }
        }, 1000);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load exam. Check if you have attempts left.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadExam();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const handleSelectOption = (questionId, optionText, isMultiple = false) => {
    if (isMultiple) {
      const current = answers[questionId] || [];
      const updated = current.includes(optionText)
        ? current.filter(o => o !== optionText)
        : [...current, optionText];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: optionText });
    }
  };

  const handleTextChange = (questionId, text) => {
    setAnswers({ ...answers, [questionId]: text });
  };

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Are you sure you want to submit your exam?')) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);

    try {
      // Map state answers to matching submission schema API expectations
      const formattedAnswers = Object.keys(answers).map(qId => {
        const val = answers[qId];
        const q = questions.find(item => item._id === qId);
        if (q?.type === 'multiple-correct') {
          return { questionId: qId, selectedOptions: val };
        } else if (q?.type === 'fill-in-the-blank' || q?.type === 'short-answer') {
          return { questionId: qId, textAnswer: val };
        } else {
          return { questionId: qId, selectedOption: val };
        }
      });

      const res = await submitExam(id, {
        answers: formattedAnswers,
        timeSpent: (exam?.duration || 30) * 60 - timeLeft,
      });

      const result = res.data.data;
      setSubmissionResult(result);
      toast.success(result.isPassed ? 'Passed! 🎉' : 'Failed. Try again next time.');
    } catch {
      toast.error('Failed to submit exam');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple-correct': return 'Multiple Correct Options';
      case 'mcq': return 'Multiple Choice (Single Option)';
      case 'true-false': return 'True / False Statement';
      case 'fill-in-the-blank': return 'Fill in the Blank';
      case 'short-answer': return 'Short Written Answer';
      default: return 'Assessment Question';
    }
  };

  if (loading) {
    return (
      <div className="exam-loading-wrapper">
        <Loader text="Initializing secure, proctored classroom environment..." />
        <div className="secure-loading-indicator">
          <HiOutlineShieldCheck />
          <span>Encryption & Proctoring active</span>
        </div>
      </div>
    );
  }

  if (submissionResult) {
    const isPassed = submissionResult.isPassed;
    const score = submissionResult.score || 0;
    const totalMarks = submissionResult.totalMarks || 0;
    const percentage = submissionResult.percentage || 0;

    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[#06080e] transition-colors duration-300">
        <div className="w-full max-w-xl glass-card p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl relative overflow-hidden text-center animate-scale-in">
          
          {/* Ambient Glow */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            isPassed ? 'bg-emerald-500/15' : 'bg-rose-500/15'
          }`} />

          {/* Trophy Badge */}
          <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border bg-gradient-to-b from-white to-slate-100 dark:from-white/10 dark:to-white/5 border-slate-200 dark:border-white/10 mb-6">
            {isPassed ? '🏆' : '🎯'}
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            {isPassed ? 'Exam Passed!' : 'Exam Completed'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto font-medium">
            {isPassed 
              ? 'Congratulations! You have successfully passed the assessment thresholds.' 
              : 'Your response was recorded. Review your performance metrics below.'}
          </p>

          {/* Score Badge Card */}
          <div className="my-8 p-6 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex flex-col items-center justify-center gap-1">
            <span className="text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent tracking-tight font-heading">
              {percentage}%
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
              Overall Score
            </span>
          </div>

          {/* 4 Metric Grid Cards */}
          <div className="grid grid-cols-2 gap-3.5 mb-8">
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-left">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Marks Secured
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-heading">
                {score} / {totalMarks}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-left">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Evaluation Status
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${
                isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {isPassed ? 'Passed' : 'Failed'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-left">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Attempt Registered
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white font-heading">
                #{submissionResult.attemptNumber || 1}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] text-left">
              <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Verification Status
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                Verified ✓
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                if (exam?.courseId) {
                  navigate(`/courses/${exam.courseId}/learn`);
                } else {
                  navigate('/dashboard');
                }
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-black text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Course Classroom</span>
              <HiOutlineArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (!exam) return <div className="container mt-12 text-center"><h3>Exam not found</h3></div>;

  const currentQuestion = questions[activeIdx];
  const answeredCount = Object.keys(answers).filter(key => {
    const val = answers[key];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && val !== '';
  }).length;
  const progressPercentage = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  
  const isTimeLow = timeLeft < 300;
  const isTimeUrgent = timeLeft < 60;

  return (
    <div className="exam-take-page">
      {/* HEADER ROW */}
      <div className="exam-take-header">
        <div className="exam-take-title">
          <div className="exam-title-pill">Assessment Console</div>
          <h2>{exam.title}</h2>
          <div className="proctor-badge">
            <span className="proctor-pulse-dot" />
            <HiOutlineShieldCheck className="text-emerald-500" size={16} />
            <span>Secure proctored session active (Violations: {violations}/3)</span>
          </div>
        </div>
        
        <div className="exam-header-right">
          <button className="btn-instructions-toggle" onClick={() => setShowInstructions(true)}>
            <HiOutlineInformationCircle size={18} />
            <span>Exam Rules</span>
          </button>
          
          <div className={`exam-take-timer ${isTimeUrgent ? 'timer-urgent' : isTimeLow ? 'timer-low' : ''}`}>
            <HiOutlineClock size={22} />
            <div className="timer-label-box">
              <span className="timer-sub-label">{isTimeUrgent ? 'URGENT' : 'TIME REMAINING'}</span>
              <span className="timer-text">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* WORKSPACE & SIDEBAR */}
      <div className="exam-take-body">
        {/* NAVIGATOR SIDEBAR */}
        <div className="exam-q-navigator">
          <div className="navigator-header">
            <h4>Questions Overview</h4>
            <span className="nav-progress-text">{answeredCount} of {questions.length} Answered ({progressPercentage}%)</span>
          </div>

          <div className="navigator-progress-bar">
            <div className="navigator-progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>

          <div className="exam-navigator-grid">
            {questions.map((q, idx) => {
              const isAnswered = answers[q._id] && (Array.isArray(answers[q._id]) ? answers[q._id].length > 0 : answers[q._id] !== '');
              const dotClass = activeIdx === idx 
                ? 'dot-active' 
                : isAnswered 
                  ? 'dot-answered' 
                  : '';
              return (
                <button key={q._id} className={`navigator-dot ${dotClass}`} onClick={() => setActiveIdx(idx)}>
                  <span>{idx + 1}</span>
                  {isAnswered && <span className="dot-check-badge"><HiCheck /></span>}
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-white/5">
            <button 
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 transition-all duration-300"
              onClick={() => setShowConfirmModal(true)}
            >
              Submit Assessment →
            </button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="exam-q-workspace animate-page-enter" key={activeIdx}>
          {currentQuestion ? (
            <div className="exam-question-item">
              <div className="exam-question-meta">
                <span className="exam-q-number">Question {activeIdx + 1} of {questions.length}</span>
                <span className="exam-q-type-tag">{getQuestionTypeLabel(currentQuestion.type)}</span>
              </div>
              
              <p className="exam-q-text">{currentQuestion.text}</p>
              
              <div className="exam-options-list">
                {currentQuestion.type === 'mcq' || currentQuestion.type === 'true-false' || currentQuestion.type === 'multiple-correct' ? (
                  (currentQuestion.type === 'true-false' ? [{ text: 'True' }, { text: 'False' }] : currentQuestion.options)?.map((opt, i) => {
                    const isMultiple = currentQuestion.type === 'multiple-correct';
                    const isSelected = isMultiple
                      ? answers[currentQuestion._id]?.includes(opt.text)
                      : answers[currentQuestion._id] === opt.text;

                    return (
                      <button key={i} className={`option-btn ${isSelected ? 'option-selected' : ''}`} onClick={() => handleSelectOption(currentQuestion._id, opt.text, isMultiple)}>
                        <div className="option-btn-content">
                          <span className="option-prefix">{String.fromCharCode(65 + i)}</span>
                          <span className="option-text">{opt.text}</span>
                          <div className={`option-check-icon ${isMultiple ? 'check-box' : 'check-radio'} ${isSelected ? 'icon-active' : ''}`}>
                            {isSelected && <HiCheck />}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="exam-input-container">
                    <input type="text" className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Type your answer here..." value={answers[currentQuestion._id] || ''} onChange={(e) => handleTextChange(currentQuestion._id, e.target.value)} id="text-answer-input" />
                  </div>
                )}
              </div>

              <div className="exam-q-actions">
                <button 
                  className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-extrabold text-xs hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all" 
                  disabled={activeIdx === 0} 
                  onClick={() => setActiveIdx(activeIdx - 1)}
                >
                  <HiChevronLeft size={16} /> Previous Question
                </button>
                <button 
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all" 
                  disabled={activeIdx === questions.length - 1} 
                  onClick={() => setActiveIdx(activeIdx + 1)}
                >
                  Next Question <HiChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <p>No questions in this exam</p>
          )}
        </div>
      </div>

      {/* OVERLAY MODAL: RULES & INSTRUCTIONS */}
      {showInstructions && (
        <div className="exam-modal-overlay animate-fade-in" onClick={() => setShowInstructions(false)}>
          <div className="exam-modal-card glass-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="exam-modal-header">
              <h3>Exam Rules & Guidelines</h3>
              <button className="modal-close-btn" onClick={() => setShowInstructions(false)}>&times;</button>
            </div>
            <div className="exam-modal-body">
              <div className="instruction-item">
                <span className="inst-icon inst-icon-warning">⚠️</span>
                <div>
                  <strong>Secure Proctoring Active</strong>
                  <p>Do not switch tabs or leave the browser window. System tracks focus. 3 violations auto-submits your exam immediately.</p>
                </div>
              </div>
              <div className="instruction-item">
                <span className="inst-icon inst-icon-clock">⏰</span>
                <div>
                  <strong>Time Constraint</strong>
                  <p>You have {exam.duration} minutes to complete this exam. The timer runs continuously once started.</p>
                </div>
              </div>
              <div className="instruction-item">
                <span className="inst-icon inst-icon-target">🎯</span>
                <div>
                  <strong>Passing Score & Marks</strong>
                  <p>Passing marks is {exam.passingMarks} out of {exam.totalMarks}. Ensure you answer all questions before submitting.</p>
                </div>
              </div>
              <div className="instruction-item">
                <span className="inst-icon inst-icon-save">💾</span>
                <div>
                  <strong>Auto-Saving</strong>
                  <p>Your answers are kept locally. Make sure to press Submit Exam when done.</p>
                </div>
              </div>
            </div>
            <button className="btn btn-primary w-full mt-4" onClick={() => setShowInstructions(false)}>Got It, Back to Exam</button>
          </div>
        </div>
      )}

      {/* OVERLAY MODAL: SUBMISSION CONFIRMATION */}
      {showConfirmModal && (
        <div className="exam-modal-overlay animate-fade-in" onClick={() => setShowConfirmModal(false)}>
          <div className="exam-modal-card text-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mx-auto mb-4 border border-amber-500/20 shadow-sm">
              ⚠️
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              Submit Your Assessment?
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Are you sure you want to finish and submit your exam? You cannot modify your answers after submission.
            </p>
            
            <div className="grid grid-cols-3 gap-3 my-6">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-center">
                <span className="block text-xl font-black text-indigo-600 dark:text-indigo-300 font-heading">
                  {answeredCount} / {questions.length}
                </span>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                  Answered
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-center">
                <span className="block text-xl font-black text-amber-600 dark:text-amber-400 font-heading">
                  {questions.length - answeredCount}
                </span>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                  Skipped
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-center">
                <span className="block text-xl font-black text-purple-600 dark:text-purple-300 font-heading">
                  {formatTime(timeLeft)}
                </span>
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                  Time Left
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                type="button"
                className="py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 font-extrabold text-xs transition-all cursor-pointer" 
                onClick={() => setShowConfirmModal(false)}
              >
                Keep Working
              </button>
              <button 
                type="button"
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer" 
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit(true);
                }}
              >
                Yes, Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTake;
