import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignment, submitAssignment } from '../api/assignmentApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlineUpload, HiOutlineLink } from 'react-icons/hi';
import './AssignmentView.css';

const AssignmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const res = await getAssignment(id);
        setAssignment(res.data.data);
      } catch {
        toast.error('Failed to load assignment details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadAssignment();
  }, [id]);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (githubUrl.trim()) formData.append('githubUrl', githubUrl.trim());
      
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await submitAssignment(id, formData);
      toast.success('Assignment submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading assignment desk..." />;
  if (!assignment) return <div className="container"><h3>Assignment not found</h3></div>;

  return (
    <div className="assignment-page">
      <div className="container">
        <div className="assignment-header animate-fade-in-up">
          <HiOutlineDocumentText className="assignment-header-icon" />
          <h1 className="section-title">{assignment.title}</h1>
          <span className="badge badge-accent">{assignment.type.replace('-', ' ')}</span>
        </div>

        <div className="assignment-body">
          <div className="assignment-details glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3>Instructions</h3>
            <p>{assignment.description || 'No description provided.'}</p>
            {assignment.instructions && (
              <div className="assignment-instructions">
                <strong>Submission Instructions:</strong>
                <p>{assignment.instructions}</p>
              </div>
            )}
            <div className="assignment-meta-summary">
              <div><span>Total Marks</span><strong>{assignment.totalMarks}</strong></div>
              <div><span>Passing Marks</span><strong>{assignment.passingMarks}</strong></div>
              {assignment.dueDate && <div><span>Due Date</span><strong>{new Date(assignment.dueDate).toLocaleDateString()}</strong></div>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="assignment-submit-box glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }} id="assignment-submit-form">
            <h3>Your Submission</h3>
            
            {assignment.type === 'github-project' || assignment.type === 'coding' ? (
              <div className="input-group">
                <label htmlFor="github-repo-url">GitHub Repository URL</label>
                <div className="input-icon-wrapper">
                  <HiOutlineLink className="input-icon" />
                  <input id="github-repo-url" type="url" className="input-field input-with-icon" placeholder="https://github.com/username/project" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required={assignment.type === 'github-project'} />
                </div>
              </div>
            ) : null}

            {assignment.type === 'file-submission' || assignment.type === 'coding' ? (
              <div className="input-group">
                <label htmlFor="assignment-files-upload">Upload Files (ZIP, PDF, DOCX)</label>
                <div className="file-uploader-box">
                  <HiOutlineUpload size={32} />
                  <input id="assignment-files-upload" type="file" multiple onChange={handleFileChange} required={assignment.type === 'file-submission' && selectedFiles.length === 0} />
                  <span>{selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'Drag files here or click to browse'}</span>
                </div>
              </div>
            ) : null}

            {assignment.type === 'mcq' && (
              <p className="assignment-mcq-note">This assignment uses dynamic quiz sheets inside the classroom workspace. Complete it in the learning view.</p>
            )}

            {assignment.type !== 'mcq' && (
              <button type="submit" className="btn btn-primary btn-lg w-full mt-md" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Assignment'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentView;
