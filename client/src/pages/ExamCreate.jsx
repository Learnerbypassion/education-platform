import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createExam } from '../api/examApi';
import { togglePublish } from '../api/courseApi';
import toast from 'react-hot-toast';
import CustomSelect from '../components/common/CustomSelect';
import { 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineHashtag, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineBookOpen,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiCheck,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt
} from 'react-icons/hi';
import './ExamCreate.css';

const ExamCreate = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: 30,
    passingMarks: 40,
    totalMarks: 100,
    maxAttempts: 2,
    isRandomized: true,
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Dynamic question builder states
  const [newQ, setNewQ] = useState({
    type: 'mcq',
    text: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    correctAnswer: '',
    marks: 10,
  });

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQ.text.trim()) {
      toast.error('Please enter the question text!');
      return;
    }

    // Validate MCQ correct answer selection
    if (newQ.type === 'mcq') {
      const hasCorrect = newQ.options.some(opt => opt.isCorrect && opt.text.trim());
      if (!hasCorrect) {
        toast.error('Please select at least one correct option for MCQ!');
        return;
      }
    }

    // Validate True/False answer selection
    if (newQ.type === 'true-false' && !newQ.correctAnswer) {
      toast.error('Please select the correct answer (True or False)!');
      return;
    }

    // Validate Fill-in-the-blank answer
    if (newQ.type === 'fill-in-the-blank' && !newQ.correctAnswer.trim()) {
      toast.error('Please specify the correct answer keyword!');
      return;
    }

    if (editingIndex !== null) {
      const updated = questions.map((q, idx) => idx === editingIndex ? newQ : q);
      setQuestions(updated);
      setEditingIndex(null);
      toast.success('Question updated successfully!');
    } else {
      setQuestions([...questions, newQ]);
      toast.success('Question added to layout outline!');
    }
    
    // Reset builder form
    setNewQ({
      type: 'mcq',
      text: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: '',
      marks: 10,
    });
  };

  const handleEditQuestion = (idx) => {
    setNewQ(questions[idx]);
    setEditingIndex(idx);
    toast.success('Question loaded into editor!');
  };

  const handleDeleteQuestion = (idx) => {
    if (!window.confirm('Are you sure you want to remove this question?')) return;
    setQuestions(questions.filter((_, i) => i !== idx));
    toast.success('Question removed!');
    if (editingIndex === idx) {
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewQ({
      type: 'mcq',
      text: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      correctAnswer: '',
      marks: 10,
    });
  };

  const handleOptionChange = (idx, field, value) => {
    const updatedOptions = newQ.options.map((opt, i) => {
      if (i === idx) return { ...opt, [field]: value };
      return opt;
    });
    setNewQ({ ...newQ, options: updatedOptions });
  };

  const handleAddOption = () => {
    setNewQ({
      ...newQ,
      options: [...newQ.options, { text: '', isCorrect: false }],
    });
  };

  const handleRemoveOption = (idx) => {
    if (newQ.options.length <= 2) {
      toast.error('MCQs must have at least 2 options!');
      return;
    }
    setNewQ({
      ...newQ,
      options: newQ.options.filter((_, i) => i !== idx),
    });
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      toast.error('Add at least one question to save the exam!');
      return;
    }

    const calculatedTotal = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    if (form.passingMarks > calculatedTotal) {
      toast.error(`Passing marks (${form.passingMarks}) cannot be greater than total question marks (${calculatedTotal})!`);
      return;
    }

    setLoading(true);
    try {
      const cleanedQuestions = questions.map(q => {
        if (q.type !== 'mcq' && q.type !== 'multiple-correct') {
          return { ...q, options: [] };
        }
        return {
          ...q,
          options: q.options.filter(opt => opt.text.trim() !== '')
        };
      });

      await createExam({
        ...form,
        courseId,
        questions: cleanedQuestions,
        isPublished: true,
      });
      toast.success('Exam published successfully!');
      navigate(`/dashboard`);
    } catch {
      toast.error('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exam-page">
      {/* Studio Header Banner */}
      <div className="create-exam-header-banner">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 mb-1">
            <button type="button" onClick={() => navigate(-1)} className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
              <HiOutlineArrowLeft size={14} /> Back to Course Studio
            </button>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400">Exam Builder</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-2">
            Assessment Creation Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Configure exam duration, passing threshold, and build interactive test questions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 inline-flex items-center gap-1.5">
            <HiOutlineAcademicCap size={14} /> {questions.length} {questions.length === 1 ? 'Question' : 'Questions'} Added
          </span>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await togglePublish(courseId);
                toast.success(res.data.data.isPublished ? '🎉 Course published live!' : 'Course reverted to draft!');
              } catch {
                toast.error('Failed to update course publish status');
              }
            }}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HiOutlineGlobeAlt size={16} /> Publish Course Live 🌐
          </button>
        </div>
      </div>
      
      <div className="create-exam-layout">
        {/* Left Column: Exam Configuration Form */}
        <form onSubmit={handleSubmitExam} className="create-exam-form" id="exam-create-form">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 inline-flex items-center gap-1">
              <HiOutlineBookOpen size={12} /> Parameters
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading mt-1">
              Exam Configuration
            </h3>
          </div>

          <div className="space-y-2">
            <label htmlFor="exam-title" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Exam Title
            </label>
            <input 
              id="exam-title" 
              type="text" 
              className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
              placeholder="e.g. Mid-Term DevOps Quiz & Docker Assessment" 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration Input with Stepper */}
            <div className="space-y-2">
              <label htmlFor="exam-dur" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <HiOutlineClock className="text-purple-500" size={15} /> Duration (min)
              </label>
              <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
                <button
                  type="button"
                  className="w-10 py-3 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-white/5 font-extrabold text-base transition-all cursor-pointer select-none border-r border-slate-200 dark:border-slate-800 flex items-center justify-center"
                  onClick={() => setForm({ ...form, duration: Math.max(5, (form.duration || 0) - 5) })}
                >
                  -
                </button>
                <input 
                  id="exam-dur" 
                  type="number" 
                  min="1" 
                  className="w-full text-center py-3 bg-transparent text-slate-900 dark:text-white font-bold text-sm outline-none" 
                  value={form.duration} 
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} 
                  required 
                />
                <button
                  type="button"
                  className="w-10 py-3 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-white/5 font-extrabold text-base transition-all cursor-pointer select-none border-l border-slate-200 dark:border-slate-800 flex items-center justify-center"
                  onClick={() => setForm({ ...form, duration: (form.duration || 0) + 5 })}
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                      form.duration === mins
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20 ring-2 ring-purple-500/30'
                        : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 border border-slate-200/80 dark:border-white/5'
                    }`}
                    onClick={() => setForm({ ...form, duration: mins })}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Pass Marks Input with Stepper */}
            <div className="space-y-2">
              <label htmlFor="exam-pass" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <HiOutlineCheckCircle className="text-emerald-500" size={15} /> Pass Marks
              </label>
              <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
                <button
                  type="button"
                  className="w-10 py-3 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-white/5 font-extrabold text-base transition-all cursor-pointer select-none border-r border-slate-200 dark:border-slate-800 flex items-center justify-center"
                  onClick={() => setForm({ ...form, passingMarks: Math.max(1, (form.passingMarks || 0) - 1) })}
                >
                  -
                </button>
                <input 
                  id="exam-pass" 
                  type="number" 
                  min="1" 
                  className="w-full text-center py-3 bg-transparent text-slate-900 dark:text-white font-bold text-sm outline-none" 
                  value={form.passingMarks} 
                  onChange={(e) => setForm({ ...form, passingMarks: parseInt(e.target.value) || 0 })} 
                  required 
                />
                <button
                  type="button"
                  className="w-10 py-3 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-white/5 font-extrabold text-base transition-all cursor-pointer select-none border-l border-slate-200 dark:border-slate-800 flex items-center justify-center"
                  onClick={() => setForm({ ...form, passingMarks: (form.passingMarks || 0) + 1 })}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Marks Input with Stepper */}
            <div className="space-y-2">
              <label htmlFor="exam-total" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <HiOutlineHashtag className="text-pink-500" size={15} /> Total Marks
              </label>
              <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm">
                <button
                  type="button"
                  className="w-10 py-3 text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-slate-200/60 dark:hover:bg-white/5 font-extrabold text-base transition-all cursor-pointer select-none border-r border-slate-200 dark:border-slate-800 flex items-center justify-center"
                  onClick={() => setForm({ ...form, totalMarks: Math.max(5, (form.totalMarks || 0) - 5) })}
                >
                  -
                </button>
                <input 
                  id="exam-total" 
                  type="number" 
                  min="1" 
                  className="w-full text-center py-3 bg-transparent text-slate-900 dark:text-white font-bold text-sm outline-none" 
                  value={form.totalMarks} 
                  onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 0 })} 
                  required 
                />
                <button
                  type="button"
                  className="w-10 py-3 text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-slate-200/60 dark:hover:bg-white/5 font-extrabold text-base transition-all cursor-pointer select-none border-l border-slate-200 dark:border-slate-800 flex items-center justify-center"
                  onClick={() => setForm({ ...form, totalMarks: (form.totalMarks || 0) + 5 })}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/5">
            <button 
              type="submit" 
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-white/20" 
              disabled={loading}
            >
              {loading ? (
                'Publishing Exam...'
              ) : (
                <>
                  <HiOutlineAcademicCap size={20} /> Create & Publish Exam <HiOutlineArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Question Bank Builder */}
        <div className="create-exam-question-builder">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/20 inline-flex items-center gap-1">
                <HiOutlineDocumentText size={12} /> Question Builder
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-heading mt-1">
                {editingIndex !== null ? `Editing Question #${editingIndex + 1}` : 'Add New Question'}
              </h3>
            </div>

            {editingIndex !== null && (
              <button 
                type="button" 
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 text-xs font-extrabold hover:bg-slate-200 transition-all"
                onClick={handleCancelEdit}
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleAddQuestion} id="add-question-form" className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="q-type" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Question Format Type
              </label>
              <CustomSelect
                id="q-type"
                name="type"
                value={newQ.type}
                onChange={(e) => setNewQ({ ...newQ, type: e.target.value })}
                options={[
                  { value: 'mcq', label: 'MCQ (Multiple Choice Single Answer)' },
                  { value: 'true-false', label: 'True / False Statement' },
                  { value: 'fill-in-the-blank', label: 'Fill in the Blank Keyword' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="q-text" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Question Prompt Text
              </label>
              <input 
                id="q-text" 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                placeholder="e.g. Which Docker command builds an image from a Dockerfile?" 
                value={newQ.text} 
                onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} 
                required 
              />
            </div>

            {newQ.type === 'mcq' && (
              <div className="builder-options-list space-y-3">
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Options & Correct Answer Checkbox
                </label>
                {newQ.options.map((opt, idx) => (
                  <div key={idx} className="builder-option-row">
                    <span className="option-letter-badge">{String.fromCharCode(65 + idx)}</span>
                    <input 
                      type="text" 
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      placeholder={`Option ${String.fromCharCode(65 + idx)}...`} 
                      value={opt.text} 
                      onChange={(e) => handleOptionChange(idx, 'text', e.target.value)} 
                      required 
                    />
                    
                    <label className={`correct-toggle-badge ${opt.isCorrect ? 'is-active' : ''}`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={opt.isCorrect} 
                        onChange={(e) => handleOptionChange(idx, 'isCorrect', e.target.checked)} 
                      />
                      <HiCheck size={14} />
                      <span>{opt.isCorrect ? 'Correct' : 'Mark Correct'}</span>
                    </label>

                    {newQ.options.length > 2 && (
                      <button 
                        type="button" 
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                        onClick={() => handleRemoveOption(idx)}
                        title="Remove Option"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-xl text-xs font-extrabold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center gap-1.5 self-start mt-1" 
                  onClick={handleAddOption}
                >
                  <HiOutlinePlus size={14} /> Add Option
                </button>
              </div>
            )}

            {newQ.type === 'true-false' && (
              <div className="space-y-2">
                <label htmlFor="tf-answer" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Correct Answer Choice
                </label>
                <CustomSelect
                  id="tf-answer"
                  name="correctAnswer"
                  value={newQ.correctAnswer}
                  onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                  options={[
                    { value: 'true', label: 'True' },
                    { value: 'false', label: 'False' },
                  ]}
                  placeholder="Select Correct Option..."
                />
              </div>
            )}

            {newQ.type === 'fill-in-the-blank' && (
              <div className="space-y-2">
                <label htmlFor="fib-answer" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Correct Keyword Match
                </label>
                <input 
                  id="fib-answer" 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 font-semibold text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                  placeholder="Exact answer string (case insensitive)..." 
                  value={newQ.correctAnswer} 
                  onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })} 
                  required 
                />
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-4"
            >
              <HiOutlinePlus size={16} />
              {editingIndex !== null ? 'Save Question Edits' : 'Add Question to Layout Outline'}
            </button>
          </form>

          {/* Added Questions List Section */}
          <div className="added-questions-preview pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                Added Questions Bank ({questions.length})
              </h4>
            </div>

            {questions.length === 0 ? (
              <div className="text-slate-400 text-xs py-6 text-center italic border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No questions added to this exam layout yet.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div key={idx} className="added-question-card">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-[11px]">
                          #{idx + 1}
                        </span>
                        <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-extrabold">
                          {q.type.replace('-', ' ')}
                        </span>
                      </span>

                      {/* Distinct Action Buttons (Edit & Delete separated!) */}
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 text-xs font-extrabold flex items-center gap-1 transition-all" 
                          onClick={() => handleEditQuestion(idx)}
                        >
                          <HiOutlinePencil size={13} /> Edit
                        </button>
                        <button 
                          type="button" 
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 text-xs font-extrabold flex items-center gap-1 transition-all" 
                          onClick={() => handleDeleteQuestion(idx)}
                        >
                          <HiOutlineTrash size={13} /> Delete
                        </button>
                      </div>
                    </div>

                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {q.text}
                    </p>

                    {q.type === 'mcq' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div 
                            key={oIdx} 
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                              opt.isCorrect 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30' 
                                : 'bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-slate-400 border border-slate-200/60 dark:border-white/5'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                            {opt.isCorrect && <HiCheck className="text-emerald-500 font-bold" size={14} />}
                          </div>
                        ))}
                      </div>
                    )}

                    {['true-false', 'fill-in-the-blank'].includes(q.type) && (
                      <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/20 w-fit">
                        Correct Answer: {q.correctAnswer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreate;
