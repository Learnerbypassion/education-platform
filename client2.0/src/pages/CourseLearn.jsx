import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, updateProgress, getEnrolledCourses } from '../api/courseApi';
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
  const [certUrl, setCertUrl] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCourseData = async () => {
    try {
      const courseRes = await getCourseById(id);
      const data = courseRes.data.data;
      setCourse(data);

      // Select first lesson by default
      if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
        setActiveLesson(data.modules[0].lessons[0]);
      }

      // Fetch assignments and exams
      const [assignmentsRes, examsRes] = await Promise.all([
        getAssignments(id),
        getExams(id),
      ]);
      setAssignments(assignmentsRes.data.data);
      setExams(examsRes.data.data);

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
          {course.modules?.map((mod) => (
            <div key={mod._id} className="classroom-mod-item">
              <span className="classroom-mod-label">{mod.structureLabel || 'Section'}</span>
              <h4>{mod.title}</h4>
              <div className="classroom-lessons-sublist">
                {mod.lessons?.map((les) => (
                  <button key={les._id} className={`classroom-les-btn ${activeLesson?._id === les._id ? 'classroom-les-active' : ''}`} onClick={() => handleLessonSelect(les)}>
                    <span>{les.type === 'video' ? <HiOutlinePlay /> : <HiOutlineDocumentText />} {les.title}</span>
                    {completedIds.has(les._id) && <span style={{ color: 'var(--color-success)' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Assignments list */}
          {assignments.length > 0 && (
            <div className="classroom-mod-item">
              <h4>Assignments</h4>
              <div className="classroom-lessons-sublist">
                {assignments.map((ass) => (
                  <Link key={ass._id} to={`/assignments/${ass._id}/view`} className="classroom-les-btn">
                    <span>📝 {ass.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Exams list */}
          {exams.length > 0 && (
            <div className="classroom-mod-item">
              <h4>Exams & Assessments</h4>
              <div className="classroom-lessons-sublist">
                {exams.map((ex) => (
                  <Link key={ex._id} to={`/exams/${ex._id}/take`} className="classroom-les-btn">
                    <span>🏆 {ex.title}</span>
                  </Link>
                ))}
              </div>
            </div>
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
            {activeLesson.type === 'video' && activeLesson.videoEmbedUrl ? (
              <div className="classroom-player-wrapper">
                <iframe src={activeLesson.videoEmbedUrl} title={activeLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            ) : (
              <div className="classroom-document-placeholder">
                <HiOutlineDocumentText size={48} />
                <span>Text / Document Material Workspace</span>
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
        ) : (
          <div className="classroom-empty">
            <HiOutlineBookOpen size={48} />
            <p>Select a lesson from the outline drawer to begin learning</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseLearn;
