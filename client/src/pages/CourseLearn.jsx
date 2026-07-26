import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, updateProgress, getEnrolledCourses, getMySubmissions, startLesson } from '../api/courseApi';
import { getAssignments } from '../api/assignmentApi';
import { getExams, requestExamAttempt } from '../api/examApi';
import { generateCertificate } from '../api/certificateApi';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { 
  HiOutlineBookOpen, 
  HiOutlineChevronRight, 
  HiOutlineChevronDown, 
  HiOutlinePlay, 
  HiOutlineDocumentText, 
  HiOutlineAcademicCap, 
  HiOutlineMenu, 
  HiOutlineX,
  HiOutlineArrowLeft,
  HiOutlineCloudDownload,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
  HiOutlineSparkles
} from 'react-icons/hi';
import './CourseLearn.css';
import DOMPurify from 'dompurify';

const CourseLearn = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [submissions, setSubmissions] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [viewingAssessments, setViewingAssessments] = useState(false);
  const [certUrl, setCertUrl] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true });

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
    } catch (err) {
      console.error('Failed to load course contents:', err);
      toast.error(`Failed to load course contents: ${err.message || 'Unknown Error'}`);
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

  const handleRequestAttempt = async (examId) => {
    const reason = window.prompt('Please enter a brief reason for requesting extra attempts:');
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('Reason is required to submit a request');
      return;
    }

    try {
      await requestExamAttempt(examId, reason);
      toast.success('Extra attempt request submitted successfully!');
      fetchCourseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleLessonSelect = async (lesson) => {
    setActiveLesson(lesson);
    setSidebarOpen(false);
    try {
      await startLesson(lesson._id);
    } catch (err) {
      console.error('Failed to start lesson', err);
    }
  };

  // Group modules by week and sort weeks
  const modulesByWeek = {};
  course?.modules?.forEach(mod => {
    const w = mod.week || 1;
    if (!modulesByWeek[w]) {
      modulesByWeek[w] = [];
    }
    modulesByWeek[w].push(mod);
  });
  const weeksList = Object.keys(modulesByWeek).map(Number).sort((a, b) => a - b);

  const getWeekProgress = (weekNum) => {
    const weekMods = modulesByWeek[weekNum] || [];
    let total = 0;
    let completed = 0;
    weekMods.forEach(mod => {
      total += mod.lessons?.length || 0;
      completed += mod.lessons?.filter(l => completedIds.has(l._id)).length || 0;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const totalCourseLessons = course?.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
  const completedCourseLessons = course?.modules?.reduce((acc, mod) => acc + (mod.lessons?.filter(l => completedIds.has(l._id)).length || 0), 0) || 0;
  const coursePercent = totalCourseLessons > 0 ? ((completedCourseLessons / totalCourseLessons) * 100).toFixed(1) : '0.0';

  const allLessons = course?.modules?.reduce((acc, mod) => [...acc, ...(mod.lessons || [])], []) || [];
  const currentLessonIndex = activeLesson ? allLessons.findIndex(l => l._id === activeLesson._id) : -1;
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;

  const getEmbedUrl = (lesson) => {
    if (!lesson) return null;
    if (lesson.videoEmbedUrl) return lesson.videoEmbedUrl;
    const urlToParse = lesson.videoUrl || (lesson.title && lesson.title.trim().startsWith('http') ? lesson.title.trim() : null);
    if (!urlToParse) return null;

    const ytMatch = urlToParse.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    const vimeoMatch = urlToParse.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return urlToParse.startsWith('http') ? urlToParse : null;
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#06070c]"><Loader text="Entering classroom workspace..." /></div>;
  if (!course) return <div className="container" style={{ padding: '4rem 0' }}><h3>Workspace not found</h3></div>;

  return (
    <div className="classroom-page">
      {/* Mobile sidebar outline toggle button */}
      <button
        className="classroom-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle course outline"
      >
        {sidebarOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
        <span>{sidebarOpen ? 'Close Drawer' : 'Course Outline'}</span>
      </button>

      {/* Mobile drawer backdrop overlay */}
      <div
        className={`classroom-overlay ${sidebarOpen ? 'classroom-overlay-active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`classroom-sidebar ${sidebarOpen ? 'classroom-sidebar-open' : ''}`}>
        <div className="classroom-sidebar-banner">
          <div className="classroom-banner-header">
            <h4>{course.title}</h4>
          </div>
          <div className="classroom-banner-progress-wrapper">
            <div className="classroom-banner-progress-text">
              <span>Overall Progress</span>
              <span>{coursePercent}%</span>
            </div>
            <div className="classroom-banner-progress-bar">
              <div className="classroom-banner-progress-fill" style={{ width: `${coursePercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="classroom-modules-list">
          {weeksList.map((weekNum) => {
            const weekModules = modulesByWeek[weekNum] || [];
            const weekProgress = getWeekProgress(weekNum);
            const isExpanded = !!expandedWeeks[weekNum];
            return (
              <div key={weekNum} className="classroom-week-group">
                <button
                  type="button"
                  className={`classroom-week-header-btn ${isExpanded ? 'week-expanded' : ''}`}
                  onClick={() => toggleWeek(weekNum)}
                >
                  <div className="classroom-progress-circle">
                    <span>{weekProgress}%</span>
                  </div>
                  <span className="classroom-week-title">Week {weekNum}</span>
                  <span className="classroom-accordion-indicator">
                    {isExpanded ? <HiOutlineChevronDown size={14} /> : <HiOutlineChevronRight size={14} />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="classroom-week-modules-sublist">
                    {weekModules.map((mod) => {
                      const modTotal = mod.lessons?.length || 0;
                      const modCompleted = mod.lessons?.filter(l => completedIds.has(l._id)).length || 0;
                      const modProgress = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
                      const isActive = activeModule?._id === mod._id && !viewingAssessments;
                      return (
                        <button
                          key={mod._id}
                          className={`classroom-chapter-btn ${isActive ? 'chapter-active' : ''}`}
                          onClick={() => handleModuleSelect(mod)}
                        >
                          <div className="classroom-progress-circle-small">
                            <span>{modProgress}%</span>
                          </div>
                          <span className="chapter-title">{mod.title}</span>
                          <span className="classroom-accordion-indicator">
                            <HiOutlineChevronRight size={12} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          
          {(exams.length > 0 || assignments.length > 0) && (
            <>
              <div className="classroom-sidebar-section-title">ASSESSMENTS</div>
              <button
                className={`classroom-chapter-btn ${viewingAssessments ? 'chapter-active' : ''}`}
                onClick={handleSelectAssessments}
              >
                <div className="classroom-progress-circle-small">
                  <span>📝</span>
                </div>
                <span className="chapter-title">Exams & Assignments</span>
              </button>
            </>
          )}
        </div>

        <div className="classroom-sidebar-footer">
          {certUrl ? (
            <Link to={certUrl} className="btn-detail-primary text-center block w-full py-3 font-extrabold shadow-lg">View Certificate 🏆</Link>
          ) : (
            <button onClick={handleGenerateCertificate} disabled={generatingCert} className="btn-detail-primary w-full py-3 font-extrabold shadow-lg">
              {generatingCert ? 'Checking Eligibility...' : 'Claim Certificate 🎓'}
            </button>
          )}
        </div>
      </div>

      <div className="classroom-main">
        {activeLesson ? (
          <div className="classroom-viewport animate-page-enter" key={activeLesson._id}>
            <div className="classroom-viewport-header-row">
              <button className="classroom-back-to-chapter-btn" onClick={() => setActiveLesson(null)}>
                <HiOutlineArrowLeft size={18} /> Back to Chapter Outline
              </button>
              
              {prevLesson && (
                <button className="classroom-prev-lesson-pill" onClick={() => handleLessonSelect(prevLesson)}>
                  ← Lesson {currentLessonIndex}: {prevLesson.title}
                </button>
              )}
            </div>

            <div className="classroom-lesson-details-header">
              <div className="classroom-lesson-counter">
                Lesson {currentLessonIndex + 1} of {allLessons.length}
              </div>
              <h2 className="classroom-lesson-title">{activeLesson.title}</h2>
              <div className="classroom-title-underline"></div>
            </div>
            
            {activeLesson.type === 'video' || activeLesson.type === 'lecture' || activeLesson.type === 'dpp-video' ? (
              (() => {
                const embedUrl = getEmbedUrl(activeLesson);
                return embedUrl ? (
                  <div className="classroom-player-wrapper">
                    <iframe src={embedUrl} title={activeLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  <div className="classroom-document-placeholder">
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">No video stream URL configured for this lesson.</span>
                  </div>
                );
              })()
            ) : (
              <div className="classroom-document-placeholder">
                <HiOutlineDocumentText size={56} className="text-indigo-500" />
                <span className="text-slate-900 dark:text-white text-base font-extrabold">Document Material & Learning Content</span>
                {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                  <div className="classroom-attachment-downloads mt-2">
                    {activeLesson.attachments.map((file, fIdx) => (
                      <a key={fIdx} href={file.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md transition-all duration-300">
                        <HiOutlineCloudDownload size={16} /> Download {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="classroom-content-details">
              {activeLesson.content && <div className="classroom-markdown-content mt-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activeLesson.content) }} />}
              
              <div className="classroom-action-row">
                <button onClick={handleMarkComplete} disabled={completedIds.has(activeLesson._id)} className={`px-6 py-3 rounded-xl font-extrabold text-sm transition-all duration-300 ${
                  completedIds.has(activeLesson._id) 
                    ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 border border-slate-200 dark:border-white/5 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md active:scale-95'
                }`}>
                  {completedIds.has(activeLesson._id) ? 'Completed ✓' : 'Mark as Complete'}
                </button>
              </div>
            </div>
          </div>
        ) : viewingAssessments ? (
          <div className="classroom-chapter-outline-view animate-page-enter">
            <div className="classroom-chapter-header">
              <h2>Course Assessments</h2>
              <p>Practice tests, graded exams, and assignments for verification</p>
            </div>
            
            <div className="classroom-cards-list mt-8">
              {exams.map((ex) => {
                const examSubmission = submissions.find(s => s.examId?._id === ex._id);
                const hasAttemptsLeft = (ex.attemptsLeft === undefined) || (ex.attemptsLeft > 0);
                
                return (
                  <div key={ex._id} className="classroom-material-card">
                    {examSubmission && (
                      <div className="card-completed-badge">✓</div>
                    )}
                    <div className="material-card-left">
                      <div className="material-card-icon-box">
                        🏆
                      </div>
                    </div>
                    <div className="material-card-center">
                      <div className="material-meta">
                        <span className="material-type-tag">Exam Assessment</span>
                        {examSubmission && <span className="material-score">Score: {examSubmission.score} / {examSubmission.totalMarks} ({examSubmission.percentage}%)</span>}
                      </div>
                      <h4 className="material-title">{ex.title}</h4>
                      <p className="material-desc">
                        Duration: {ex.duration} mins • Passing Score: {ex.passingMarks} / {ex.totalMarks}
                        <span className="block text-[11px] text-slate-400 font-semibold mt-1">
                          Attempts: {ex.attemptsUsed ?? 0} / {ex.totalAllowedAttempts ?? ex.maxAttempts} used • {ex.attemptsLeft ?? ex.maxAttempts} left
                        </span>
                      </p>
                    </div>
                    <div className="material-card-right flex flex-col items-end gap-2">
                      {hasAttemptsLeft ? (
                        <Link to={`/exams/${ex._id}/take`} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md active:scale-95">
                          {ex.attemptsUsed > 0 ? 'Retake Exam' : 'Start Exam'}
                        </Link>
                      ) : (
                        <>
                          {ex.requestStatus === 'pending' ? (
                            <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
                              Request Pending
                            </span>
                          ) : ex.requestStatus === 'rejected' ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold">
                                Request Rejected
                              </span>
                              <button
                                onClick={() => handleRequestAttempt(ex._id)}
                                className="text-[11px] font-bold text-indigo-500 hover:text-indigo-400 underline"
                              >
                                Re-request Attempts
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRequestAttempt(ex._id)}
                              className="px-4 py-2 border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 rounded-xl text-xs font-bold transition-all"
                            >
                              Request Extra Attempts
                            </button>
                          )}
                        </>
                      )}
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
                      <div className="material-card-icon-box">
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
                      <Link to={`/assignments/${ass._id}/view`} className="px-5 py-2.5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold text-center block transition-all duration-300">
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
              <p>Module Outline & Learning Materials</p>
            </div>

            <div className="classroom-tabs-bar">
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
                <div className="classroom-empty-materials text-center py-20 text-slate-400 dark:text-slate-500 font-medium">
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
                          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md" onClick={() => handleLessonSelect(les)}>
                            Watch Lesson
                          </button>
                        ) : (
                          <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md" onClick={() => handleLessonSelect(les)}>
                            Open Notes
                          </button>
                        )}

                        {les.attachments && les.attachments.length > 0 && (
                          <a
                            href={les.attachments[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-slate-200/80 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04] rounded-xl text-xs font-bold text-center transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            PDF Attachment
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
            <HiOutlineBookOpen size={56} className="text-indigo-500 animate-bounce" />
            <p>Select a chapter from the outline drawer to begin learning</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLearn;
