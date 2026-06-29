import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createExam } from '../api/examApi';
import toast from 'react-hot-toast';
import './ExamCreate.css';

const ExamCreate = () => {
  const { id: courseId } = useParams(); // URL context course id
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
    if (!newQ.text.trim()) return;
    setQuestions([...questions, newQ]);
    
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
    toast.success('Question added to layout outline!');
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

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    if (questions.length === 0) {
      toast.error('Add at least one question to save the exam!');
      return;
    }
    setLoading(true);
    try {
      await createExam({
        ...form,
        courseId,
        questions,
      });
      toast.success('Exam generated successfully!');
      navigate(`/dashboard`);
    } catch {
      toast.error('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exam-page">
      <h1 className="section-title">Schedule <span className="gradient-text">New Exam</span></h1>
      
      <div className="create-exam-layout">
        <form onSubmit={handleSubmitExam} className="create-exam-form glass-card" id="exam-create-form">
          <div className="input-group">
            <label htmlFor="exam-title">Exam Title</label>
            <input id="exam-title" type="text" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div className="grid grid-3">
            <div className="input-group">
              <label htmlFor="exam-dur">Duration (min)</label>
              <input id="exam-dur" type="number" className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} required />
            </div>
            <div className="input-group">
              <label htmlFor="exam-pass">Passing Marks</label>
              <input id="exam-pass" type="number" className="input-field" value={form.passingMarks} onChange={(e) => setForm({ ...form, passingMarks: parseInt(e.target.value) || 0 })} required />
            </div>
            <div className="input-group">
              <label htmlFor="exam-total">Total Marks</label>
              <input id="exam-total" type="number" className="input-field" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 0 })} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Creating Exam...' : 'Create & Publish Exam'}
          </button>
        </form>

        <div className="create-exam-question-builder glass-card">
          <h3>Add Question Layout</h3>
          <form onSubmit={handleAddQuestion} id="add-question-form">
            <div className="input-group">
              <label htmlFor="q-type">Question Type</label>
              <select id="q-type" className="input-field" value={newQ.type} onChange={(e) => setNewQ({ ...newQ, type: e.target.value })}>
                <option value="mcq">MCQ (Single choice)</option>
                <option value="true-false">True / False</option>
                <option value="fill-in-the-blank">Fill in the Blank</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="q-text">Question Text</label>
              <input id="q-text" type="text" className="input-field" placeholder="Enter question..." value={newQ.text} onChange={(e) => setNewQ({ ...newQ, text: e.target.value })} required />
            </div>

            {newQ.type === 'mcq' && (
              <div className="builder-options-list">
                <label>Options</label>
                {newQ.options.map((opt, idx) => (
                  <div key={idx} className="builder-option-row">
                    <input type="text" className="input-field" placeholder={`Option ${idx + 1}`} value={opt.text} onChange={(e) => handleOptionChange(idx, 'text', e.target.value)} required />
                    <input type="checkbox" checked={opt.isCorrect} onChange={(e) => handleOptionChange(idx, 'isCorrect', e.target.checked)} />
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddOption}>+ Add Option</button>
              </div>
            )}

            {newQ.type === 'true-false' && (
              <div className="input-group">
                <label htmlFor="tf-answer">Correct Answer</label>
                <select id="tf-answer" className="input-field" value={newQ.correctAnswer} onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}>
                  <option value="">Select True/False</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            )}

            {newQ.type === 'fill-in-the-blank' && (
              <div className="input-group">
                <label htmlFor="fib-answer">Correct Answer Keyword</label>
                <input id="fib-answer" type="text" className="input-field" placeholder="Exact answer keyword..." value={newQ.correctAnswer} onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })} required />
              </div>
            )}

            <button type="submit" className="btn btn-accent btn-sm mt-md">Add Question to Exam</button>
          </form>

          <div className="outline-modules-list" style={{ marginTop: '20px' }}>
            <h4>Questions Added: {questions.length}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamCreate;
