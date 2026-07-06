import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createAssignment, updateAssignment, getAssignment } from '../api/assignmentApi';
import { getCourseById } from '../api/courseApi';
import toast from 'react-hot-toast';
import './ExamCreate.css'; // Reuse exam create styles for layout

const AssignmentCreate = () => {
  const { courseId, id } = useParams(); // courseId on create, id on edit
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'file-submission',
    totalMarks: 100,
    passingMarks: 40,
    maxAttempts: 3,
    instructions: '',
    dueDate: '',
    moduleId: '',
  });

  const [modules, setModules] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dynamic question builder states (for MCQ type assignments)
  const [newQ, setNewQ] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 10,
  });

  useEffect(() => {
    const fetchCourseData = async (targetCourseId) => {
      try {
        const res = await getCourseById(targetCourseId);
        setModules(res.data.data.modules || []);
      } catch (err) {
        toast.error('Failed to load course modules');
      }
    };

    const loadExistingAssignment = async () => {
      setLoading(true);
      try {
        const res = await getAssignment(id);
        const assign = res.data.data;
        setForm({
          title: assign.title,
          description: assign.description || '',
          type: assign.type,
          totalMarks: assign.totalMarks,
          passingMarks: assign.passingMarks,
          maxAttempts: assign.maxAttempts || 3,
          instructions: assign.instructions || '',
          dueDate: assign.dueDate ? new Date(assign.dueDate).toISOString().split('T')[0] : '',
          moduleId: assign.moduleId || '',
        });
        if (assign.questions) {
          setQuestions(assign.questions);
        }
        await fetchCourseData(assign.courseId);
      } catch (err) {
        toast.error('Failed to load assignment data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isEdit) {
      loadExistingAssignment();
    } else if (courseId) {
      fetchCourseData(courseId);
    }
  }, [courseId, id, isEdit, navigate]);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQ.questionText.trim()) return;
    if (!newQ.correctAnswer.trim()) {
      toast.error('Please specify the correct answer');
      return;
    }
    setQuestions([...questions, newQ]);
    
    // Reset builder form
    setNewQ({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 10,
    });
    toast.success('Question added to outline!');
  };

  const handleOptionChange = (idx, value) => {
    const updatedOptions = [...newQ.options];
    updatedOptions[idx] = value;
    setNewQ({ ...newQ, options: updatedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submissionData = {
      ...form,
      courseId: isEdit ? undefined : courseId,
      questions: form.type === 'mcq' ? questions : [],
    };

    try {
      if (isEdit) {
        await updateAssignment(id, submissionData);
        toast.success('Assignment updated successfully!');
      } else {
        await createAssignment({ ...submissionData, courseId });
        toast.success('Assignment created successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exam-page animate-page-enter">
      <h1 className="section-title">
        {isEdit ? 'Edit' : 'Create'}{' '}
        <span className="gradient-text">Assignment</span>
      </h1>

      <div className="create-exam-layout">
        <form onSubmit={handleSubmit} className="create-exam-form glass-card" id="assignment-create-form">
          <div className="input-group">
            <label htmlFor="assign-title">Assignment Title</label>
            <input
              id="assign-title"
              type="text"
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="assign-desc">Description</label>
            <textarea
              id="assign-desc"
              className="input-field"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label htmlFor="assign-type">Assignment Type</label>
              <select
                id="assign-type"
                className="input-field"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="file-submission">File Submission</option>
                <option value="coding">Coding (ZIP + Repository)</option>
                <option value="github-project">GitHub Project</option>
                <option value="mcq">MCQ Quiz Sheet</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="assign-module">Associated Module (Optional)</label>
              <select
                id="assign-module"
                className="input-field"
                value={form.moduleId}
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
              >
                <option value="">None</option>
                {modules.map((mod) => (
                  <option key={mod._id} value={mod._id}>
                    {mod.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-3">
            <div className="input-group">
              <label htmlFor="assign-total">Total Marks</label>
              <input
                id="assign-total"
                type="number"
                className="input-field"
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="assign-pass">Passing Marks</label>
              <input
                id="assign-pass"
                type="number"
                className="input-field"
                value={form.passingMarks}
                onChange={(e) => setForm({ ...form, passingMarks: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="assign-attempts">Max Attempts</label>
              <input
                id="assign-attempts"
                type="number"
                className="input-field"
                value={form.maxAttempts}
                onChange={(e) => setForm({ ...form, maxAttempts: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="input-group">
              <label htmlFor="assign-due">Due Date</label>
              <input
                id="assign-due"
                type="date"
                className="input-field"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="assign-inst">Submission Instructions</label>
            <textarea
              id="assign-inst"
              className="input-field"
              rows={3}
              placeholder="Tell students how to submit..."
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Assignment' : 'Create Assignment'}
          </button>
        </form>

        {form.type === 'mcq' && (
          <div className="create-exam-question-builder glass-card">
            <h3>Add MCQ Question</h3>
            <form onSubmit={handleAddQuestion} id="mcq-question-form">
              <div className="input-group">
                <label htmlFor="q-text">Question Text</label>
                <input
                  id="q-text"
                  type="text"
                  className="input-field"
                  value={newQ.questionText}
                  onChange={(e) => setNewQ({ ...newQ, questionText: e.target.value })}
                  placeholder="Enter question text..."
                  required
                />
              </div>

              <div className="builder-options-list">
                <label>Options</label>
                {newQ.options.map((opt, idx) => (
                  <div key={idx} className="builder-option-row">
                    <input
                      type="text"
                      className="input-field"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      required
                    />
                    <input
                      type="radio"
                      name="correct-mcq-option"
                      checked={newQ.correctAnswer === opt && opt !== ''}
                      onChange={() => setNewQ({ ...newQ, correctAnswer: opt })}
                    />
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-accent btn-sm mt-md">
                Add Question
              </button>
            </form>

            <div className="outline-modules-list" style={{ marginTop: '20px' }}>
              <h4>Questions Added: {questions.length}</h4>
              <ul style={{ listStyle: 'decimal', paddingLeft: '20px' }}>
                {questions.map((q, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300">
                    {q.questionText} ({q.marks} marks)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentCreate;
