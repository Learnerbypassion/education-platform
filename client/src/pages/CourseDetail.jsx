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
  HiOutlineChevronDown,
  HiOutlineCheck,
  HiOutlineShieldCheck,
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

  if (loading) return <Loader text="Loading course syllabus..." />;
  if (!course) return <div className="container py-16 text-center"><h3>Course not found</h3></div>;

  const creator = course.creatorId || {};

  return (
    <div className="course-detail-page min-h-screen bg-transparent text-slate-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          
          {/* Left Column: Course Header, Instructor & Syllabus */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="course-detail-category-badge-pill">
                  {getCategoryLabel(course.category)}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {course.difficulty || 'All Levels'}
                </span>
              </div>
              
              <h1 className="course-detail-title text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
                {course.title}
              </h1>
              
              <p className="course-detail-subtitle text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                {course.shortDescription || (course.description && course.description.slice(0, 180) + '...')}
              </p>
              
              {/* Metadata strip */}
              <div className="course-detail-meta-list">
                <div className="course-meta-pill">
                  <HiOutlineClock size={15} className="text-slate-500" />
                  <span>{course.estimatedDuration || 'Self-paced'}</span>
                </div>
                <div className="course-meta-pill">
                  <HiOutlineGlobe size={15} className="text-slate-500" />
                  <span className="capitalize">{course.language || 'English'}</span>
                </div>
                <div className="course-meta-pill">
                  <HiOutlineBookOpen size={15} className="text-slate-500" />
                  <span className="capitalize">{course.structureType?.replace('-', ' ')}</span>
                </div>
                {course.enrollmentCount > 0 && (
                  <div className="course-meta-pill">
                    <HiOutlineAcademicCap size={15} className="text-slate-500" />
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
                <span className="instructor-label">Faculty Author</span>
                <span className="instructor-name text-slate-900 dark:text-white flex items-center gap-1.5 font-bold">
                  {creator.name || 'Instructor'} 
                  <HiOutlineShieldCheck className="text-slate-500" title="Verified Creator" size={16} />
                </span>
              </div>
            </div>

            {/* About / Description Card */}
            <div className="detail-content-card">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">About this course</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                {course.description}
              </p>

              {/* Course Highlights Grid */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <HiOutlineCheck className="text-slate-900 dark:text-white shrink-0" />
                  <span>Sequential course syllabus & video modules</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <HiOutlineCheck className="text-slate-900 dark:text-white shrink-0" />
                  <span>Automated examination & assessment scoring</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <HiOutlineCheck className="text-slate-900 dark:text-white shrink-0" />
                  <span>Verifiable certificate of completion</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <HiOutlineCheck className="text-slate-900 dark:text-white shrink-0" />
                  <span>Ongoing access to curriculum resources</span>
                </div>
              </div>
            </div>

            {/* Syllabus Accordion Card */}
            <div className="detail-content-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Curriculum Syllabus</h2>
                <span className="text-xs font-mono text-slate-500">
                  {course.modules?.length || 0} Modules
                </span>
              </div>
              
              <div className="syllabus-accordion-list space-y-2">
                {course.modules?.map((mod, i) => {
                  const isOpen = !!openModules[mod._id];
                  return (
                    <div key={mod._id} className={`accordion-module border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-[#11131c] ${isOpen ? 'active' : ''}`}>
                      <button 
                        onClick={() => toggleModule(mod._id)} 
                        className="p-4 flex justify-between items-center w-full text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                      >
                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">
                            {mod.structureLabel || `Module ${i + 1}`}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                            {mod.title}
                          </h4>
                        </div>
                        <HiOutlineChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isOpen && (
                        <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800">
                          {mod.lessons && mod.lessons.length > 0 ? (
                            <div className="space-y-1.5 pt-2">
                              {mod.lessons.map((les) => (
                                <div key={les._id} className="flex justify-between items-center py-1.5 text-xs text-slate-600 dark:text-slate-300">
                                  <span className="flex items-center gap-2">
                                    <HiOutlinePlay size={13} className="text-slate-400 shrink-0" />
                                    <span>{les.title}</span>
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                                    {les.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs py-2 italic">No lessons in this module yet.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Action Card */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] overflow-hidden shadow-xs">
              {/* Thumbnail Container */}
              <div className="h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img 
                  src={imageError ? getCourseThumbnail({ ...course, thumbnail: null }) : getCourseThumbnail(course)} 
                  alt={course.title} 
                  className="w-full h-full object-cover" 
                  onError={() => setImageError(true)}
                />
              </div>

              {/* Action Body */}
              <div className="p-6 space-y-5">
                <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tuition</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <HiOutlineCheck className="text-slate-900 dark:text-white" />
                    <span>Complete syllabus access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCheck className="text-slate-900 dark:text-white" />
                    <span>Verified certificate upon completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCheck className="text-slate-900 dark:text-white" />
                    <span>Desktop and mobile classroom access</span>
                  </div>
                </div>
                
                {enrolled ? (
                  <div className="space-y-2.5 pt-2">
                    <Link to={`/courses/${id}/learn`} className="btn btn-primary w-full py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2">
                      <span>Open Classroom</span> 
                      <HiOutlineArrowRight size={15} />
                    </Link>
                    {(isInstructor || isAdmin || user?._id === creator?._id) && (
                      <Link 
                        to={`/course/${id}/edit`} 
                        className="btn btn-outline w-full py-2.5 px-4 text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <HiOutlinePencil size={14} /> Edit Course
                      </Link>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={handleEnroll} 
                    className="btn btn-primary w-full py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Enroll in Course</span>
                    <HiOutlineArrowRight size={15} />
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
