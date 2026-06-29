import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById, enrollCourse, getEnrolledCourses } from '../api/courseApi';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { HiOutlineClock, HiOutlineBookOpen, HiOutlineGlobe, HiOutlineAcademicCap } from 'react-icons/hi';
import { getCategoryLabel } from '../utils/helpers';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseById(id);
        setCourse(res.data.data);

        // Check if student is enrolled
        if (isAuthenticated) {
          const enrollmentsRes = await getCourseById(id); // Reload or fetch enrollments
          // For simplicity, let's see if course details includes enrollment info,
          const enrolledList = await getEnrolledCourses();
          const isAlreadyEnrolled = enrolledList.data.data.some(e => e.courseId?._id === id);
          setEnrolled(isAlreadyEnrolled);
        }
      } catch (err) {
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, isAuthenticated]);

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

  if (loading) return <Loader text="Loading course detail..." />;
  if (!course) return <div className="container" style={{ padding: '4rem 0' }}><h3>Course not found</h3></div>;

  return (
    <div className="course-detail-page">
      <div className="course-detail-hero">
        <div className="container">
          <div className="course-hero-content animate-fade-in-up">
            <span className="badge badge-primary">{getCategoryLabel(course.category)}</span>
            <h1 className="course-hero-title">{course.title}</h1>
            <p className="course-hero-subtitle">{course.shortDescription || course.description.slice(0, 200)}...</p>
            <div className="course-hero-meta">
              <span><HiOutlineClock /> {course.estimatedDuration || 'Self-paced'}</span>
              <span><HiOutlineGlobe /> {course.language}</span>
              <span><HiOutlineBookOpen /> {course.structureType.replace('-', ' ')}</span>
            </div>
          </div>
          <div className="course-hero-card glass-card animate-scale-in">
            {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="course-hero-thumb" />}
            <div className="course-hero-card-body">
              <span className="course-hero-price">{course.price === 0 ? 'Free' : `$${course.price}`}</span>
              {enrolled ? (
                <Link to={`/courses/${id}/learn`} className="btn btn-primary btn-lg course-enroll-btn">Go to Course</Link>
              ) : (
                <button onClick={handleEnroll} className="btn btn-accent btn-lg course-enroll-btn">Enroll Now</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container course-detail-body">
        <div className="course-main-content">
          <div className="course-section glass-card">
            <h2>About this course</h2>
            <p>{course.description}</p>
          </div>

          <div className="course-section glass-card">
            <h2>Course Syllabus</h2>
            <div className="course-syllabus-list">
              {course.modules?.map((mod, i) => (
                <div key={mod._id} className="syllabus-module">
                  <h4>{mod.structureLabel || `Module ${i + 1}`}: {mod.title}</h4>
                  <div className="syllabus-lessons">
                    {mod.lessons?.map((les) => (
                      <div key={les._id} className="syllabus-lesson">
                        <span>📄 {les.title}</span>
                        <span className="badge badge-primary">{les.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
