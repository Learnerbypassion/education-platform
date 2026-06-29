import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/dashboard/StatsCard';
import Loader from '../components/common/Loader';
import CourseCard from '../components/course/CourseCard';
import { getStudentStats, getInstructorStats, getAdminStats } from '../api/analyticsApi';
import { getEnrolledCourses, getInstructorCourses } from '../api/courseApi';
import { HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineClipboardCheck, HiOutlineUsers, HiOutlineChartBar, HiOutlineDocumentText } from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin, isInstructor } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const [stats, setStats] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        let statsRes;
        if (isAdmin) statsRes = await getAdminStats();
        else if (isInstructor) statsRes = await getInstructorStats();
        else statsRes = await getStudentStats();
        setStats(statsRes.data.data);

        // Fetch lists based on tab
        if (tab === 'enrolled') {
          const res = await getEnrolledCourses();
          setCoursesList(res.data.data);
        } else if (tab === 'courses') {
          const res = await getInstructorCourses();
          setCoursesList(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAdmin, isInstructor, tab]);

  if (loading) return <Loader text="Loading dashboard content..." />;

  // Render Enrolled Courses
  if (tab === 'enrolled') {
    return (
      <div className="dashboard-page">
        <h1 className="section-title">Enrolled <span className="gradient-text">Courses</span></h1>
        <p className="section-subtitle">Resume your learning journey where you left off</p>
        
        {coursesList.length === 0 ? (
          <div className="empty-state">
            <HiOutlineBookOpen size={48} />
            <h3>No enrolled courses</h3>
            <Link to="/courses" className="btn btn-primary mt-md">Browse Catalog</Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {coursesList.map((enrollment) => (
              <div key={enrollment._id} className="dashboard-course-item">
                <CourseCard course={enrollment.courseId} />
                <div className="dashboard-progress-bar glass-card">
                  <span>Progress: {enrollment.progress}%</span>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${enrollment.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Instructor's Created Courses
  if (tab === 'courses') {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header-row">
          <div>
            <h1 className="section-title">My Created <span className="gradient-text">Courses</span></h1>
            <p className="section-subtitle">Manage, edit, and publish your content</p>
          </div>
          <Link to="/course/create" className="btn btn-primary">Create Course</Link>
        </div>

        {coursesList.length === 0 ? (
          <div className="empty-state">
            <HiOutlineDocumentText size={48} />
            <h3>No courses created yet</h3>
            <Link to="/course/create" className="btn btn-primary mt-md">Create Your First Course</Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {coursesList.map((course) => (
              <div key={course._id} className="dashboard-course-item">
                <CourseCard course={course} />
                <div className="dashboard-course-actions glass-card">
                  <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-warning'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <Link to={`/course/${course._id}/edit`} className="btn btn-outline btn-sm">Edit Details</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Instructor Analytics Table
  if (tab === 'analytics' && (isInstructor || isAdmin)) {
    return (
      <div className="dashboard-page">
        <h1 className="section-title">Course <span className="gradient-text">Performance Analytics</span></h1>
        <p className="section-subtitle">Real-time statistics on student enrollment and exam scores</p>

        {stats?.courseStats?.length === 0 ? (
          <div className="empty-state">
            <HiOutlineChartBar size={48} />
            <h3>No performance data available</h3>
          </div>
        ) : (
          <div className="admin-table-wrapper glass-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Students Enrolled</th>
                  <th>Average Exam Score</th>
                </tr>
              </thead>
              <tbody>
                {stats?.courseStats?.map((c) => (
                  <tr key={c.courseId}>
                    <td className="admin-user-cell">{c.title}</td>
                    <td>{c.students} students</td>
                    <td>
                      <span className="badge badge-success">
                        {c.averageScore ? `${Math.round(c.averageScore)}%` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Fallback / Overview Tab
  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome animate-fade-in-up">
        <h1>Welcome back, <span className="gradient-text">{user?.name}</span> 👋</h1>
        <p className="dashboard-role badge badge-primary">{user?.role}</p>
      </div>

      {/* Student Stats */}
      {!isInstructor && !isAdmin && stats && (
        <div className="grid grid-4 dashboard-stats animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StatsCard icon={<HiOutlineBookOpen />} label="Enrolled Courses" value={stats.enrolledCourses || 0} color="var(--color-primary)" />
          <StatsCard icon={<HiOutlineClipboardCheck />} label="Completed" value={stats.completedCourses || 0} color="var(--color-success)" />
          <StatsCard icon={<HiOutlineChartBar />} label="In Progress" value={stats.inProgressCourses || 0} color="var(--color-warning)" />
          <StatsCard icon={<HiOutlineAcademicCap />} label="Certificates" value={stats.certificates || 0} color="var(--color-accent)" />
        </div>
      )}

      {/* Instructor Stats */}
      {isInstructor && !isAdmin && stats && (
        <div className="grid grid-4 dashboard-stats animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StatsCard icon={<HiOutlineBookOpen />} label="Total Courses" value={stats.totalCourses || 0} color="var(--color-primary)" />
          <StatsCard icon={<HiOutlineDocumentText />} label="Published" value={stats.publishedCourses || 0} color="var(--color-success)" />
          <StatsCard icon={<HiOutlineUsers />} label="Total Students" value={stats.totalStudents || 0} color="var(--color-info)" />
          <StatsCard icon={<HiOutlineClipboardCheck />} label="Submissions" value={stats.totalSubmissions || 0} color="var(--color-warning)" />
        </div>
      )}

      {/* Admin Stats */}
      {isAdmin && stats && (
        <div className="grid grid-4 dashboard-stats animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <StatsCard icon={<HiOutlineUsers />} label="Total Users" value={stats.totalUsers || 0} color="var(--color-primary)" />
          <StatsCard icon={<HiOutlineBookOpen />} label="Total Courses" value={stats.totalCourses || 0} color="var(--color-success)" />
          <StatsCard icon={<HiOutlineClipboardCheck />} label="Enrollments" value={stats.totalEnrollments || 0} color="var(--color-info)" />
          <StatsCard icon={<HiOutlineAcademicCap />} label="Certificates" value={stats.totalCertificates || 0} color="var(--color-accent)" />
        </div>
      )}

      <div className="dashboard-section glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2>Quick Actions</h2>
        <div className="dashboard-actions">
          {isInstructor || isAdmin ? (
            <>
              <Link to="/course/create" className="btn btn-primary">Create Course</Link>
              <Link to="/courses" className="btn btn-outline">View All Courses</Link>
            </>
          ) : (
            <>
              <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
              <Link to="/certificates" className="btn btn-outline">My Certificates</Link>
              <Link to="/verify" className="btn btn-ghost">Verify Certificate</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
