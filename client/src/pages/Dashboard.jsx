import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/dashboard/StatsCard';
import Loader from '../components/common/Loader';
import CourseCard from '../components/course/CourseCard';
import { getStudentStats, getInstructorStats, getAdminStats } from '../api/analyticsApi';
import { getEnrolledCourses, getInstructorCourses } from '../api/courseApi';
import { HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineClipboardCheck, HiOutlineUsers, HiOutlineChartBar, HiOutlineDocumentText } from 'react-icons/hi';

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

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader text="Loading dashboard content..." /></div>;

  // Render Enrolled Courses
  if (tab === 'enrolled') {
    return (
      <div className="space-y-8 animate-page-enter">
        <div className="glass-card p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-heading">Enrolled <span className="gradient-text">courses</span></h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Resume your learning journey where you left off.</p>
        </div>
        {coursesList.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center px-8 py-20 text-center animate-slide-up delay-1">
            <div className="rounded-full bg-brand-50 p-6 dark:bg-brand-900/40 text-brand-500 mb-6 shadow-glow">
              <HiOutlineBookOpen size={56} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">No enrolled courses</h3>
            <p className="mt-2 text-slate-500">You haven't started any courses yet.</p>
            <Link to="/courses" className="btn btn-primary btn-lg mt-8 shadow-glow hover-lift">Browse Catalog</Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 animate-slide-up delay-1">
            {coursesList.map((enrollment, idx) => (
              <div key={enrollment._id} className={`space-y-4 hover-lift delay-${(idx % 4) + 1}`}>
                <CourseCard course={enrollment.courseId} />
                <div className="glass-card p-5">
                  <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    <span>Progress</span>
                    <span className="text-brand-600 dark:text-brand-400">{enrollment.progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400" style={{ width: `${enrollment.progress}%` }} />
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
      <div className="space-y-8 animate-page-enter">
        <div className="flex flex-col justify-between gap-6 glass-card p-8 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-heading">My created <span className="gradient-text">courses</span></h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Manage, edit, and publish your content.</p>
          </div>
          <Link to="/course/create" className="btn btn-primary btn-lg shadow-glow hover-lift">Create Course</Link>
        </div>

        {coursesList.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center px-8 py-20 text-center animate-slide-up delay-1">
            <div className="rounded-full bg-brand-50 p-6 dark:bg-brand-900/40 text-brand-500 mb-6 shadow-glow">
              <HiOutlineDocumentText size={56} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">No courses created yet</h3>
            <p className="mt-2 text-slate-500">Share your knowledge with the world.</p>
            <Link to="/course/create" className="btn btn-primary btn-lg mt-8 shadow-glow hover-lift">Create Your First Course</Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 animate-slide-up delay-1">
            {coursesList.map((course, idx) => (
              <div key={course._id} className={`space-y-4 hover-lift delay-${(idx % 4) + 1}`}>
                <CourseCard course={course} />
                <div className="glass-card flex items-center justify-between p-5">
                  <span className={`badge ${course.isPublished ? 'badge-success' : 'badge-primary'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <Link to={`/course/${course._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
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
      <div className="space-y-8 animate-page-enter">
        <div className="glass-card p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-heading">Course <span className="gradient-text">performance</span></h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Real-time statistics on enrollment and exam scores.</p>
        </div>

        {stats?.courseStats?.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center px-8 py-20 text-center animate-slide-up delay-1">
            <div className="rounded-full bg-brand-50 p-6 dark:bg-brand-900/40 text-brand-500 mb-6 shadow-glow">
              <HiOutlineChartBar size={56} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">No performance data available</h3>
          </div>
        ) : (
          <div className="glass-card overflow-hidden animate-slide-up delay-1 p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Course Title</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Students Enrolled</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Average Exam Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats?.courseStats?.map((c) => (
                    <tr key={c.courseId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{c.title}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{c.students} students</td>
                      <td className="px-6 py-4">
                        <span className="badge badge-success px-4 py-1.5 text-sm">
                          {c.averageScore ? `${Math.round(c.averageScore)}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback / Overview Tab
  return (
    <div className="space-y-8 animate-page-enter">
      <div className="glass-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-heading">Welcome back, <span className="gradient-text">{user?.name}</span></h1>
          <p className="mt-2 text-slate-500">Here's what's happening with your learning journey today.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold uppercase tracking-widest text-brand-700 dark:bg-brand-900/60 dark:text-brand-300 border border-brand-200 dark:border-brand-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          {user?.role}
        </div>
      </div>

      {!isInstructor && !isAdmin && stats && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-slide-up delay-1">
          <div className="hover-lift"><StatsCard icon={<HiOutlineBookOpen />} label="Enrolled Courses" value={stats.enrolledCourses || 0} color="#6b7aff" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineClipboardCheck />} label="Completed" value={stats.completedCourses || 0} color="#10b981" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineChartBar />} label="In Progress" value={stats.inProgressCourses || 0} color="#f59e0b" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineAcademicCap />} label="Certificates" value={stats.certificates || 0} color="#f43f5e" /></div>
        </div>
      )}

      {isInstructor && !isAdmin && stats && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-slide-up delay-1">
          <div className="hover-lift"><StatsCard icon={<HiOutlineBookOpen />} label="Total Courses" value={stats.totalCourses || 0} color="#6b7aff" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineDocumentText />} label="Published" value={stats.publishedCourses || 0} color="#10b981" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineUsers />} label="Total Students" value={stats.totalStudents || 0} color="#3b82f6" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineClipboardCheck />} label="Submissions" value={stats.totalSubmissions || 0} color="#f59e0b" /></div>
        </div>
      )}

      {isAdmin && stats && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-slide-up delay-1">
          <div className="hover-lift"><StatsCard icon={<HiOutlineUsers />} label="Total Users" value={stats.totalUsers || 0} color="#6b7aff" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineBookOpen />} label="Total Courses" value={stats.totalCourses || 0} color="#10b981" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineClipboardCheck />} label="Enrollments" value={stats.totalEnrollments || 0} color="#3b82f6" /></div>
          <div className="hover-lift"><StatsCard icon={<HiOutlineAcademicCap />} label="Certificates" value={stats.totalCertificates || 0} color="#f43f5e" /></div>
        </div>
      )}

      <div className="glass-card p-8 animate-slide-up delay-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Quick actions</h2>
        <div className="mt-6 flex flex-wrap gap-4">
          {isInstructor || isAdmin ? (
            <>
              <Link to="/course/create" className="btn btn-primary shadow-glow hover-lift">Create Course</Link>
              <Link to="/courses" className="btn btn-outline hover-lift">View All Courses</Link>
            </>
          ) : (
            <>
              <Link to="/courses" className="btn btn-primary shadow-glow hover-lift">Browse Courses</Link>
              <Link to="/verify" className="btn btn-outline hover-lift">Verify Certificate</Link>
              <Link to="/dashboard?tab=enrolled" className="btn btn-ghost hover-lift">My Courses</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
