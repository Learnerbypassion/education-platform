import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { takeExam, submitExam } from '../api/examApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';
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
  
  const timerRef = useRef(null);

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
        setTimeLeft(examData.duration * 60);

        // Prepopulate empty answers
        const initial = {};
        qList.forEach(q => {
          if (q.type === 'multiple-correct') initial[q._id] = [];
          else initial[q._id] = '';
        });
        setAnswers(initial);

        // Start countdown timer
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              toast.error('Time is up! Submitting exam.');
              handleSubmit(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        toast.error('Failed to load exam. Check if you have attempts left.');
        navigate('/dashboard');
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
        timeSpent: exam.duration * 60 - timeLeft,
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

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <Loader text="Entering secure proctored environment..." />;

  if (submissionResult) {
    return (
      <div className="exam-result-page animate-scale-in" style={{ padding: '2rem 1rem' }}>
        <div className="glass-card exam-result-card text-center max-w-md mx-auto p-8 mt-12">
          <span className="result-badge" style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>
            {submissionResult.isPassed ? '🎉' : '😢'}
          </span>
          <h2 className="text-3xl font-bold mt-4">Exam Completed!</h2>
          <p className="text-slate-500 mt-2">Your response has been graded automatically.</p>
          
          <div className="score-details mt-6 space-y-3 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Your Score</span>
              <strong className="text-brand-600 dark:text-brand-400">{submissionResult.score} / {submissionResult.totalMarks}</strong>
            </div>
            <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Percentage</span>
              <strong>{submissionResult.percentage}%</strong>
            </div>
            <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Result Status</span>
              <span className={`badge ${submissionResult.isPassed ? 'badge-success' : 'badge-primary'}`}>
                {submissionResult.isPassed ? 'Passed' : 'Failed'}
              </span>
            </div>
            <div className="flex justify-between" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Attempt Number</span>
              <strong>#{submissionResult.attemptNumber}</strong>
            </div>
          </div>
          
          <button className="btn btn-primary w-full mt-8 btn-lg" onClick={() => navigate(-1)}>
            Back to Classroom
          </button>
        </div>
      </div>
    );
  }

  if (!exam) return <div className="container"><h3>Exam not found</h3></div>;

  const currentQuestion = questions[activeIdx];

  return (
    <div className="exam-take-page">
      <div className="exam-take-header">
        <div className="exam-take-title">
          <h2>{exam.title}</h2>
          <span className="proctor-badge"><HiOutlineExclamationCircle /> Proctored Session active</span>
        </div>
        <div className="exam-take-timer">
          <HiOutlineClock />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="exam-take-body">
        <div className="exam-q-navigator glass-card">
          <h4>Questions</h4>
          <div className="exam-navigator-grid">
            {questions.map((q, idx) => (
              <button key={q._id} className={`navigator-dot ${activeIdx === idx ? 'dot-active' : answers[q._id] ? 'dot-answered' : ''}`} onClick={() => setActiveIdx(idx)}>
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="divider" />
          <button className="btn btn-accent w-full" onClick={() => handleSubmit(false)}>Submit Exam</button>
        </div>

        <div className="exam-q-workspace glass-card animate-page-enter" key={activeIdx}>
          {currentQuestion ? (
            <div className="exam-question-item">
              <span className="exam-q-number">Question {activeIdx + 1} of {questions.length}</span>
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
                        <span>{opt.text}</span>
                      </button>
                    );
                  })
                ) : (
                  <input type="text" className="input-field" placeholder="Type your answer here..." value={answers[currentQuestion._id] || ''} onChange={(e) => handleTextChange(currentQuestion._id, e.target.value)} id="text-answer-input" />
                )}
              </div>

              <div className="exam-q-actions">
                <button className="btn btn-outline" disabled={activeIdx === 0} onClick={() => setActiveIdx(activeIdx - 1)}>Previous</button>
                <button className="btn btn-outline" disabled={activeIdx === questions.length - 1} onClick={() => setActiveIdx(activeIdx + 1)}>Next</button>
              </div>
            </div>
          ) : (
            <p>No questions in this exam</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamTake;
