import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubmissions, gradeSubmission, getAssignment } from '../api/assignmentApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX, HiOutlineDownload, HiOutlineExternalLink } from 'react-icons/hi';
import './AdminPanel.css'; // Reuse table/panel styling

const GradingDashboard = () => {
  const { id } = useParams(); // Assignment ID
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Grading form state
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    score: 0,
    feedback: '',
    isPassed: false
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [assignRes, subRes] = await Promise.all([
          getAssignment(id),
          getSubmissions(id)
        ]);
        setAssignment(assignRes.data.data);
        setSubmissions(subRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load submissions');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleSelectSubmission = (sub) => {
    setActiveSubmission(sub);
    setGradeForm({
      score: sub.score || 0,
      feedback: sub.feedback || '',
      isPassed: sub.isPassed || false
    });
  };

  const handleScoreChange = (val) => {
    const score = parseInt(val) || 0;
    const isPassed = score >= (assignment ? assignment.passingMarks : 40);
    setGradeForm({ ...gradeForm, score, isPassed });
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!activeSubmission) return;
    setSubmitLoading(true);
    try {
      const res = await gradeSubmission(id, activeSubmission._id, gradeForm);
      toast.success('Grade updated successfully!');
      
      // Update submissions list locally
      setSubmissions(submissions.map(sub => 
        sub._id === activeSubmission._id ? { ...sub, ...res.data.data } : sub
      ));
      
      setActiveSubmission(null);
    } catch (err) {
      toast.error('Failed to save grade');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loader text="Loading submissions..." />;
  if (!assignment) return <div className="container"><h3>Assignment not found</h3></div>;

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  return (
    <div className="admin-panel animate-page-enter">
      <h1 className="section-title">Grading <span className="gradient-text">Desk</span></h1>
      <p className="text-slate-500 mb-md">
        Grading submissions for: <strong>{assignment.title}</strong> ({assignment.type.replace('-', ' ')})
      </p>

      <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: activeSubmission ? '2fr 1fr' : '1fr', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
          <h3>Submissions ({submissions.length})</h3>
          {submissions.length === 0 ? (
            <p className="text-center text-slate-500" style={{ padding: '40px 0' }}>No submissions yet for this assignment.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Submissions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        {sub.studentId.profileImage ? (
                          <img src={sub.studentId.profileImage} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                            {sub.studentId.name[0]}
                          </div>
                        )}
                        <span>{sub.studentId.name}</span>
                      </div>
                    </td>
                    <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td>
                      {sub.gradedAt ? (
                        sub.isPassed ? (
                          <span className="badge badge-success flex items-center gap-1 w-fit"><HiOutlineCheck /> Passed</span>
                        ) : (
                          <span className="badge badge-danger flex items-center gap-1 w-fit"><HiOutlineX /> Failed</span>
                        )
                      ) : (
                        <span className="badge badge-accent w-fit">Pending</span>
                      )}
                    </td>
                    <td>
                      {sub.gradedAt ? `${sub.score} / ${sub.totalMarks}` : `— / ${sub.totalMarks}`}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {sub.githubUrl && (
                          <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-600">
                            <HiOutlineExternalLink /> GitHub Repo
                          </a>
                        )}
                        {sub.files && sub.files.map((file, idx) => (
                          <a key={idx} href={`${serverUrl}${file.url}`} download className="flex items-center gap-1 text-xs text-brand-600">
                            <HiOutlineDownload /> File {idx + 1}
                          </a>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleSelectSubmission(sub)}>
                        {sub.gradedAt ? 'Re-grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {activeSubmission && (
          <div className="glass-card animate-slide-up" style={{ padding: '20px', height: 'fit-content' }}>
            <div className="flex justify-between items-center mb-md">
              <h3>Grade Student</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveSubmission(null)}>Close</button>
            </div>
            <p className="text-sm mb-md">Student: <strong>{activeSubmission.studentId.name}</strong></p>

            <form onSubmit={handleSaveGrade} id="grading-form" className="space-y-4">
              <div className="input-group">
                <label htmlFor="grade-score">Score (Out of {activeSubmission.totalMarks})</label>
                <input
                  id="grade-score"
                  type="number"
                  className="input-field"
                  max={activeSubmission.totalMarks}
                  min={0}
                  value={gradeForm.score}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  required
                />
              </div>

              <div className="input-group flex items-center gap-2">
                <input
                  id="grade-passed"
                  type="checkbox"
                  checked={gradeForm.isPassed}
                  onChange={(e) => setGradeForm({ ...gradeForm, isPassed: e.target.checked })}
                />
                <label htmlFor="grade-passed">Student Passed</label>
              </div>

              <div className="input-group">
                <label htmlFor="grade-feedback">Feedback & Comments</label>
                <textarea
                  id="grade-feedback"
                  className="input-field"
                  rows={4}
                  placeholder="Excellent work!..."
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Save Grade'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingDashboard;
