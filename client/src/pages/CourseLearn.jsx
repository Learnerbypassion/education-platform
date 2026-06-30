import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, updateProgress, getEnrolledCourses, getMySubmissions } from '../api/courseApi';
import { getAssignments } from '../api/assignmentApi';
import { getExams } from '../api/examApi';
import { generateCertificate } from '../api/certificateApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlineChevronRight, HiOutlinePlay, HiOutlineDocumentText, HiOutlineQuestionMarkCircle, HiOutlineAcademicCap, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import './CourseLearn.css';

const CourseLearn = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [submissions, setSubmissions] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [viewingAssessments, setViewingAssessments] = useState(false);
  const [certUrl, setCertUrl] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCourseData = async () => {
    try {
      const courseRes = await getCourseById(id);
      const data = courseRes.data.data;
      setCourse(data);

      if (data.modules?.length > 0) {
        setActiveModule(data.modules[0]);
        setViewingAssessments(false);
      }

      // Fetch assignments, exams, and submissions
      const [assignmentsRes, examsRes, submissionsRes] = await Promise.all([
        getAssignments(id),
        getExams(id),
        getMySubmissions(),
      ]);
      setAssignments(assignmentsRes.data.data);
      setExams(examsRes.data.data);
      setSubmissions(submissionsRes.data.data);

      const enrolledRes = await getEnrolledCourses();
      const enrollmentObj = enrolledRes.data.data.find(e => e.courseId?._id === id);
      if (enrollmentObj) {
        setCompletedIds(new Set(enrollmentObj.completedLessons || []));
      }
    } catch {
      toast.error('Failed to load course contents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleModuleSelect = (mod) => {
    setActiveModule(mod);
    setViewingAssessments(false);
    setActiveLesson(null);
    setActiveTab('All');
    setSidebarOpen(false);
  };

  const handleSelectAssessments = () => {
    setViewingAssessments(true);
    setActiveModule(null);
    setActiveLesson(null);
    setSidebarOpen(false);
  };

  const getFilteredLessons = () => {
    if (!activeModule || !activeModule.lessons) return [];
    const list = activeModule.lessons;
    switch (activeTab) {
      case 'Lectures':
        return list.filter(l => ['lecture', 'video'].includes(l.type));
      case 'DPPs':
        return list.filter(l => ['dpp', 'quiz'].includes(l.type));
      case 'Notes':
        return list.filter(l => ['notes', 'document'].includes(l.type));
      case 'DPP PDFs':
        return list.filter(l => l.type === 'dpp-pdf');
      case 'DPP Videos':
        return list.filter(l => l.type === 'dpp-video');
      default:
        return list; // 'All'
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    try {
      await updateProgress(activeLesson._id, { percentComplete: 100 });
      setCompletedIds(prev => new Set([...prev, activeLesson._id]));
      toast.success('Lesson completed!');
    } catch {
      toast.error('Failed to mark lesson complete');
    }
  };

  const handleGenerateCertificate = async () => {
    setGeneratingCert(true);
    try {
      const res = await generateCertificate(id);
      setCertUrl(`/certificates/${res.data.data._id}`);
      toast.success('Certificate generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Certificate eligibility verification failed. Complete all exams/assignments.');
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader text="Entering classroom workspace..." /></div>;
  if (!course) return <div className="container" style={{ padding: '4rem 0' }}><h3>Workspace not found</h3></div>;

  return (
    <div className="classroom-page">
      {/* Mobile sidebar toggle button */}
      <button
        className="classroom-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle course outline"
      >
        {sidebarOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
        <span>{sidebarOpen ? 'Close' : 'Outline'}</span>
      </button>

      {/* Mobile overlay */}
      <div
        className={`classroom-overlay ${sidebarOpen ? 'classroom-overlay-active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`classroom-sidebar ${sidebarOpen ? 'classroom-sidebar-open' : ''}`}>
        <div className="classroom-sidebar-header">
          <Link to={`/courses/${id}`} className="classroom-back-btn">← Course Info</Link>
          <h3>{course.title}</h3>
        </div>
        <div className="classroom-modules-list">
          <div className="classroom-sidebar-section-title">ALL CHAPTERS</div>
          {course.modules?.map((mod, idx) => (
            <button
              key={mod._id}
              className={`classroom-chapter-btn ${activeModule?._id === mod._id && !viewingAssessments ? 'chapter-active' : ''}`}
              onClick={() => handleModuleSelect(mod)}
            >
              <span className="chapter-number">CH - {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
              <span className="chapter-title">{mod.title}</span>
            </button>
          ))}
          
          {(exams.length > 0 || assignments.length > 0) && (
            <>
              <div className="classroom-sidebar-section-title" style={{ marginTop: '1.5rem' }}>ASSESSMENTS</div>
              <button
                className={`classroom-chapter-btn ${viewingAssessments ? 'chapter-active' : ''}`}
                onClick={handleSelectAssessments}
              >
                <span className="chapter-number">TESTS</span>
                <span className="chapter-title">Exams & Assignments</span>
              </button>
            </>
          )}
        </div>

        <div className="classroom-sidebar-footer">
          {certUrl ? (
            <Link to={certUrl} className="btn btn-accent btn-lg w-full">View Certificate 🏆</Link>
          ) : (
            <button onClick={handleGenerateCertificate} disabled={generatingCert} className="btn btn-primary btn-lg w-full">
              {generatingCert ? 'Checking...' : 'Claim Certificate 🎓'}
            </button>
          )}
        </div>
      </div>

      <div className="classroom-main">
        {activeLesson ? (
          <div className="classroom-viewport animate-page-enter" key={activeLesson._id}>
            <button className="classroom-back-to-chapter-btn" onClick={() => setActiveLesson(null)}>
              ← Back to Outline
            </button>
            
            {activeLesson.type === 'video' || activeLesson.type === 'lecture' || activeLesson.type === 'dpp-video' ? (
              activeLesson.videoEmbedUrl ? (
                <div className="classroom-player-wrapper">
                  <iframe src={activeLesson.videoEmbedUrl} title={activeLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              ) : (
                <div className="classroom-document-placeholder">
                  <span>No video URL configured.</span>
                </div>
              )
            ) : (
              <div className="classroom-document-placeholder">
                <HiOutlineDocumentText size={48} />
                <span>Text / Document Material Workspace</span>
                {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                  <div className="classroom-attachment-downloads mt-4">
                    <strong>Attachments:</strong>
                    {activeLesson.attachments.map((file, fIdx) => (
                      <a key={fIdx} href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline mt-2 block">
                        Download {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="classroom-content-details">
              <h2>{activeLesson.title}</h2>
              {activeLesson.content && <div className="classroom-markdown-content" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />}
              
              <div className="classroom-action-row">
                <button onClick={handleMarkComplete} disabled={completedIds.has(activeLesson._id)} className={`btn ${completedIds.has(activeLesson._id) ? 'btn-outline' : 'btn-primary'} btn-lg`}>
                  {completedIds.has(activeLesson._id) ? 'Completed ✓' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          </div>
        ) : viewingAssessments ? (
          <div className="classroom-chapter-outline-view animate-page-enter">
            <div className="classroom-chapter-header">
              <h2>Course Assessments</h2>
              <p>Practice tests, assessments, and coding projects</p>
            </div>
            
            <div className="classroom-cards-list mt-8">
              {exams.map((ex) => {
                const examSubmission = submissions.find(s => s.examId?._id === ex._id);
                return (
                  <div key={ex._id} className="classroom-material-card">
                    {examSubmission && (
                      <div className="card-completed-badge">✓</div>
                    )}
                    <div className="material-card-left">
                      <div className="material-card-icon-box" style={{ background: 'rgba(91, 109, 224, 0.1)', color: 'var(--color-primary)' }}>
                        🏆
                      </div>
                    </div>
                    <div className="material-card-center">
                      <div className="material-meta">
                        <span className="material-type-tag">Practice Exam</span>
                        {examSubmission && <span className="material-score">Score: {examSubmission.score} / {examSubmission.totalMarks} ({examSubmission.percentage}%)</span>}
                      </div>
                      <h4 className="material-title">{ex.title}</h4>
                      <p className="material-desc">Duration: {ex.duration} mins • Passing Score: {ex.passingMarks} / {ex.totalMarks}</p>
                    </div>
                    <div className="material-card-right">
                      <Link to={`/exams/${ex._id}/take`} className="btn btn-primary btn-sm">
                        {examSubmission ? 'Retake Exam' : 'Start Exam'}
                      </Link>
                    </div>
                  </div>
                );
              })}

              {assignments.map((ass) => {
                const assSubmission = submissions.find(s => s.assignmentId?._id === ass._id);
                return (
                  <div key={ass._id} className="classroom-material-card">
                    {assSubmission && (
                      <div className="card-completed-badge">✓</div>
                    )}
                    <div className="material-card-left">
                      <div className="material-card-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        📝
                      </div>
                    </div>
                    <div className="material-card-center">
                      <div className="material-meta">
                        <span className="material-type-tag">Assignment Worksheet</span>
                      </div>
                      <h4 className="material-title">{ass.title}</h4>
                      <p className="material-desc">Passing Marks: {ass.passingMarks} / {ass.totalMarks}</p>
                    </div>
                    <div className="material-card-right">
                      <Link to={`/assignments/${ass._id}/view`} className="btn btn-outline btn-sm">
                        {assSubmission ? 'View Submission' : 'Submit Assignment'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeModule ? (
          <div className="classroom-chapter-outline-view animate-page-enter">
            <div className="classroom-chapter-header">
              <h2>{activeModule.title}</h2>
              <p>Section Module Course Outline Workspace</p>
            </div>

            <div className="classroom-tabs-bar mt-6">
              {['All', 'Lectures', 'DPPs', 'Notes', 'DPP PDFs', 'DPP Videos'].map((tabName) => (
                <button
                  key={tabName}
                  className={`classroom-tab-btn ${activeTab === tabName ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tabName)}
                >
                  {tabName}
                </button>
              ))}
            </div>

            <div className="classroom-cards-list mt-8">
              {getFilteredLessons().length === 0 ? (
                <div className="classroom-empty-materials text-center py-12 text-slate-400">
                  <p>No materials available in this section under "{activeTab}"</p>
                </div>
              ) : (
                getFilteredLessons().map((les) => {
                  const isCompleted = completedIds.has(les._id);
                  const isVideoType = ['video', 'lecture', 'dpp-video'].includes(les.type);
                  return (
                    <div key={les._id} className="classroom-material-card">
                      {isCompleted && (
                        <div className="card-completed-badge">✓</div>
                      )}
                      
                      <div className="material-card-left">
                        <div className="material-card-icon-box">
                          {isVideoType ? <HiOutlinePlay /> : <HiOutlineDocumentText />}
                        </div>
                      </div>
                      
                      <div className="material-card-center">
                        <div className="material-meta">
                          <span className="material-type-tag capitalize">{les.type.replace('-', ' ')}</span>
                          {les.createdAt && (
                            <span className="material-date">
                              • {new Date(les.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h4 className="material-title">{les.title}</h4>
                        {les.content && (
                          <p className="material-desc">
                            {les.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                          </p>
                        )}
                      </div>
                      
                      <div className="material-card-right flex flex-col gap-2">
                        {isVideoType ? (
                          <button className="btn btn-primary btn-sm" onClick={() => handleLessonSelect(les)}>
                            Watch
                          </button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleLessonSelect(les)}>
                            Notes & more
                          </button>
                        )}

                        {les.attachments && les.attachments.length > 0 && (
                          <a
                            href={les.attachments[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            PDF Document
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="classroom-empty">
            <HiOutlineBookOpen size={48} />
            <p>Select a chapter from the outline drawer to begin learning</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLearn;
