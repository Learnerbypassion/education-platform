import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById, enrollCourse, getEnrolledCourses } from '../api/courseApi';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { 
  HiOutlineClock, 
  HiOutlineBookOpen, 
  HiOutlineGlobe, 
  HiOutlineAcademicCap, 
  HiOutlineArrowRight, 
  HiOutlineChevronUp, 
  HiOutlineChevronDown,
  HiOutlineCheck,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlinePlay,
  HiOutlinePencil
} from 'react-icons/hi';
import { getCategoryLabel, getInitials, getCourseThumbnail } from '../utils/helpers';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isInstructor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseById(id);
        const courseData = res.data.data;
        setCourse(courseData);

        // Pre-open the first module by default if it exists
        if (courseData?.modules && courseData.modules.length > 0) {
          setOpenModules({ [courseData.modules[0]._id]: true });
        }

        // Check if student is enrolled OR if user is instructor/creator/admin
        if (isAuthenticated) {
          try {
            const enrolledList = await getEnrolledCourses();
            const isAlreadyEnrolled = enrolledList.data.data?.some(e => e.courseId?._id === id || e.courseId === id);
            const isCreatorOrStaff = isInstructor || isAdmin || user?._id === courseData.creatorId?._id || user?._id === courseData.creatorId;
            setEnrolled(isAlreadyEnrolled || isCreatorOrStaff);
          } catch {
            if (isInstructor || isAdmin) {
              setEnrolled(true);
            }
          }
        }
      } catch {
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, isAuthenticated, isInstructor, isAdmin, user]);

  const toggleModule = (moduleId) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await enrollCourse(id);
      setEnrolled(true);
      toast.success('Successfully enrolled!');
    } catch {
      toast.error('Enrollment failed');
    }
  };

  const getImageUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    const apiURL = import.meta.env.VITE_API_URL || '';
    const baseURL = apiURL.replace(/\/api\/?$/, '').replace(/\/$/, '');
    const cleanPath = thumbnailPath.startsWith('/') ? thumbnailPath : `/${thumbnailPath}`;
    return `${baseURL}${cleanPath}`;
  };

  if (loading) return <Loader text="Loading course detail..." />;
  if (!course) return <div className="container" style={{ padding: '4rem 0' }}><h3>Course not found</h3></div>;

  const creator = course.creatorId || {};

  return (
    <div className="course-detail-page min-h-screen bg-slate-50 text-slate-900 dark:bg-[#07080e] dark:text-white transition-colors duration-300 relative">
      
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="course-detail-orb-1" />
      <div className="course-detail-orb-2" />

      {/* Main Container Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 relative z-10">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          
          {/* Left Column: Course Header, Instructor & Syllabus */}
          <div className="lg:col-span-8 space-y-8 animate-fade-in-up">
            
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="course-detail-category-badge-pill">
                  <HiOutlineSparkles className="text-indigo-500 animate-pulse" />
                  {getCategoryLabel(course.category)}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  ● {course.difficulty || 'All Levels'}
                </span>
              </div>
              
              <h1 className="course-detail-title bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
                {course.title}
              </h1>
              
              <p className="course-detail-subtitle text-slate-600 dark:text-slate-350">
                {course.shortDescription || (course.description && course.description.slice(0, 180) + '...')}
              </p>
              
              {/* Metadata strip */}
              <div className="course-detail-meta-list">
                <div className="course-meta-pill">
                  <HiOutlineClock size={16} className="text-indigo-500" />
                  <span>{course.estimatedDuration || 'Self-paced'}</span>
                </div>
                <div className="course-meta-pill">
                  <HiOutlineGlobe size={16} className="text-purple-500" />
                  <span className="capitalize">{course.language || 'English'}</span>
                </div>
                <div className="course-meta-pill">
                  <HiOutlineBookOpen size={16} className="text-pink-500" />
                  <span className="capitalize">{course.structureType?.replace('-', ' ')}</span>
                </div>
                {course.enrollmentCount > 0 && (
                  <div className="course-meta-pill">
                    <HiOutlineAcademicCap size={16} className="text-emerald-500" />
                    <span>{course.enrollmentCount} Enrolled Students</span>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Card */}
            <div className="course-detail-instructor-card">
              <div className="instructor-avatar-wrap">
                <div className="instructor-avatar-inner">
                  {creator.profileImage ? (
                    <img src={getImageUrl(creator.profileImage)} alt={creator.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(creator.name)
                  )}
                </div>
              </div>
              <div className="instructor-text-wrap">
                <span className="instructor-label">Course Author</span>
                <span className="instructor-name text-slate-900 dark:text-white">
                  {creator.name || 'Instructor'} 
                  <HiOutlineShieldCheck className="text-indigo-500 text-base" title="Verified Creator" />
                </span>
              </div>
            </div>

            {/* About / Description Card */}
            <div className="detail-content-card">
              <h2 className="section-title text-slate-900 dark:text-white">About this course</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                {course.description}
              </p>

              {/* Course Highlights Grid */}
              <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-white/5 grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">✓</span>
                  <span>100% Online & Self-Paced Learning</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">✓</span>
                  <span>Auto-Graded Quizzes & Exam System</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold">✓</span>
                  <span>Verifiable Certificate of Completion</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">✓</span>
                  <span>Lifetime Unlimited Access</span>
                </div>
              </div>
            </div>

            {/* Syllabus Accordion Card */}
            <div className="detail-content-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title text-slate-900 dark:text-white mb-0">Course Syllabus</h2>
                <span className="module-count-badge">
                  {course.modules?.length || 0} Modules
                </span>
              </div>
              
              <div className="syllabus-accordion-list space-y-3.5">
                {course.modules?.map((mod, i) => {
                  const isOpen = !!openModules[mod._id];
                  return (
                    <div key={mod._id} className={`accordion-module ${isOpen ? 'active' : ''}`}>
                      <button 
                        onClick={() => toggleModule(mod._id)} 
                        className="accordion-header flex justify-between items-center w-full"
                      >
                        <div className="text-left">
                          <span className="module-label">
                            {mod.structureLabel || `Module ${i + 1}`}
                          </span>
                          <h4 className="module-title text-slate-900 dark:text-white">
                            {mod.title}
                          </h4>
                        </div>
                        <div className="accordion-toggle-icon">
                          <HiOutlineChevronDown size={16} />
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="accordion-content">
                          {mod.lessons && mod.lessons.length > 0 ? (
                            <div className="lessons-list">
                              {mod.lessons.map((les) => (
                                <div key={les._id} className="lesson-item flex justify-between items-center text-slate-700 dark:text-slate-300">
                                  <span className="lesson-title flex items-center gap-2.5 text-sm font-semibold">
                                    <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                                      <HiOutlinePlay size={14} />
                                    </span>
                                    <span>{les.title}</span>
                                  </span>
                                  <span className="lesson-type-badge">
                                    {les.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-lessons-text text-slate-400 text-xs py-2">No lessons in this module yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Floating Action Card */}
          <div className="lg:col-span-4 sticky-card-wrapper animate-scale-in">
            <div className="course-sticky-card">
              {/* Thumbnail Container */}
              <div className="sticky-card-image-container">
                <img 
                  src={imageError ? getCourseThumbnail({ ...course, thumbnail: null }) : getCourseThumbnail(course)} 
                  alt={course.title} 
                  className="sticky-card-img" 
                  onError={() => setImageError(true)}
                />
                <div className="sticky-card-image-overlay" />
              </div>

              {/* Action Body */}
              <div className="sticky-card-body">
                <div className="price-row">
                  <span className="price-label">Course Fee</span>
                  <span className="price-value">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                </div>

                <div className="course-feature-list">
                  <div className="course-feature-item">
                    <span className="feature-icon-bullet"><HiOutlineCheck /></span>
                    <span>Full Lifetime Access</span>
                  </div>
                  <div className="course-feature-item">
                    <span className="feature-icon-bullet"><HiOutlineCheck /></span>
                    <span>Official Verified Certificate</span>
                  </div>
                  <div className="course-feature-item">
                    <span className="feature-icon-bullet"><HiOutlineCheck /></span>
                    <span>Access on Mobile & Desktop</span>
                  </div>
                </div>
                
                {enrolled ? (
                  <div className="space-y-3">
                    <Link to={`/courses/${id}/learn`} className="btn-detail-primary">
                      <span>Go to Classroom</span> 
                      <HiOutlineArrowRight size={18} />
                    </Link>
                    {(isInstructor || isAdmin || user?._id === creator?._id) && (
                      <Link 
                        to={`/course/${id}/edit`} 
                        className="w-full py-3 px-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm"
                      >
                        <HiOutlinePencil size={15} /> Edit Course Workspace
                      </Link>
                    )}
                  </div>
                ) : (
                  <button onClick={handleEnroll} className="btn-detail-accent">
                    <span>Enroll in Course</span>
                    <HiOutlineArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default CourseDetail;
