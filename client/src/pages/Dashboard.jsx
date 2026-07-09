import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/dashboard/StatsCard';
import Loader from '../components/common/Loader';
import CourseCard from '../components/course/CourseCard';
import { getStudentStats, getInstructorStats, getAdminStats } from '../api/analyticsApi';
import { getEnrolledCourses, getInstructorCourses, togglePublish } from '../api/courseApi';
import { getInstructorAttemptRequests, updateAttemptRequestStatus } from '../api/examApi';
import { HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineClipboardCheck, HiOutlineUsers, HiOutlineChartBar, HiOutlineDocumentText } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin, isInstructor } = useAuth();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const [stats, setStats] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const [attemptRequests, setAttemptRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await togglePublish(courseId);
      const updated = coursesList.map(c => {
        if (c._id === courseId) {
          return { ...c, isPublished: res.data.data.isPublished };
        }
        return c;
      });
      setCoursesList(updated);
      toast.success(res.data.data.isPublished ? 'Course published successfully!' : 'Course reverted to draft!');
    } catch (err) {
      console.error('Failed to toggle course visibility:', err);
      toast.error('Failed to toggle course visibility');
    }
  };

  const handleReviewRequest = async (requestId, status) => {
    const confirmMsg = status === 'approved' 
      ? 'Approve this request and grant 2 extra attempts?' 
      : 'Reject this request?';
    if (!window.confirm(confirmMsg)) return;

    let instructorResponse = '';
    if (status === 'rejected') {
      instructorResponse = window.prompt('Enter optional feedback for rejection:') || '';
    }

    try {
      await updateAttemptRequestStatus(requestId, { status, instructorResponse });
      toast.success(`Request ${status} successfully!`);
      // Refresh list
      const res = await getInstructorAttemptRequests();
      setAttemptRequests(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review request');
    }
  };

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
        } else if (tab === 'exam-requests') {
          const res = await getInstructorAttemptRequests();
          setAttemptRequests(res.data.data || []);
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
                  <div className="flex gap-2">
                    <button type="button" className={`btn btn-sm ${course.isPublished ? 'btn-outline' : 'btn-primary'}`} onClick={() => handleTogglePublish(course._id)}>
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <Link to={`/course/${course._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Instructor's Attempt Requests
  if (tab === 'exam-requests' && (isInstructor || isAdmin)) {
    return (
      <div className="space-y-8 animate-page-enter">
        <div className="glass-card p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white font-heading">Exam Attempt <span className="gradient-text">requests</span></h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Approve or reject student requests for extra exam attempts.</p>
        </div>

        {attemptRequests.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center px-8 py-20 text-center animate-slide-up delay-1">
            <div className="rounded-full bg-brand-50 p-6 dark:bg-brand-900/40 text-brand-500 mb-6 shadow-glow">
              <HiOutlineClipboardCheck size={56} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">No attempt requests</h3>
            <p className="mt-2 text-slate-500">There are currently no requests for extra exam attempts.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden animate-slide-up delay-1 p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Course / Exam</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attemptRequests.map((reqItem) => (
                    <tr key={reqItem._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{reqItem.studentId?.name}</div>
                        <div className="text-xs text-slate-500">{reqItem.studentId?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700 dark:text-slate-200">{reqItem.examId?.title}</div>
                        <div className="text-xs text-slate-500">{reqItem.courseId?.title}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={reqItem.message}>
                        {reqItem.message || <span className="text-slate-400 italic">No reason provided</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          reqItem.status === 'approved' 
                            ? 'badge-success' 
                            : reqItem.status === 'rejected' 
                            ? 'badge-primary' 
                            : 'badge-info'
                        }`}>
                          {reqItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {reqItem.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleReviewRequest(reqItem._id, 'approved')}
                              className="btn btn-primary btn-sm"
                            >
                              Approve (+2)
                            </button>
                            <button
                              onClick={() => handleReviewRequest(reqItem._id, 'rejected')}
                              className="btn btn-outline btn-sm text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Reviewed
                          </span>
                        )}
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
          <>
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

            {stats?.recentSubmissions?.length > 0 && (
              <div className="space-y-4">
                <div className="glass-card p-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">Recent student <span className="gradient-text">submissions</span></h3>
                  <p className="text-slate-500 text-sm mt-1">Track individual grades for exams and assignments.</p>
                </div>
                <div className="glass-card overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Student</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Course</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Activity / Assessment</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 font-bold uppercase tracking-wider">Score / Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {stats?.recentSubmissions?.map((s) => (
                          <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900 dark:text-white">{s.studentId?.name}</div>
                              <div className="text-xs text-slate-500">{s.studentId?.email}</div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{s.courseId?.title}</td>
                            <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                              {s.examId?.title || s.assignmentId?.title || 'Quiz / Submission'}
                            </td>
                            <td className="px-6 py-4 capitalize text-slate-500">{s.type}</td>
                            <td className="px-6 py-4">
                              {s.type === 'exam' ? (
                                <span className={`badge ${s.isPassed ? 'badge-success' : 'badge-primary'} px-3 py-1 text-xs`}>
                                  {s.score} / {s.totalMarks} ({s.percentage}%)
                                </span>
                              ) : (
                                <span className="badge badge-info px-3 py-1 text-xs">Submitted</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
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
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-slide-up delay-1">
            <div className="hover-lift"><StatsCard icon={<HiOutlineBookOpen />} label="Enrolled Courses" value={stats.enrolledCourses || 0} color="#6b7aff" /></div>
            <div className="hover-lift"><StatsCard icon={<HiOutlineClipboardCheck />} label="Completed" value={stats.completedCourses || 0} color="#10b981" /></div>
            <div className="hover-lift"><StatsCard icon={<HiOutlineChartBar />} label="In Progress" value={stats.inProgressCourses || 0} color="#f59e0b" /></div>
            <div className="hover-lift"><StatsCard icon={<HiOutlineAcademicCap />} label="Certificates" value={stats.certificates || 0} color="#f43f5e" /></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-slide-up delay-2 mt-6">
            {/* Upcoming Exams */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white font-heading">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Upcoming Exams
              </h3>
              {stats.upcomingExams && stats.upcomingExams.length > 0 ? (
                <div className="space-y-4">
                  {stats.upcomingExams.map((exam) => (
                    <div key={exam._id} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-slate-800 dark:text-white">{exam.title}</h4>
                      <p className="text-xs text-slate-500">{exam.courseId?.title}</p>
                      <p className="text-xs text-brand-600 font-semibold mt-1">
                        Starts: {new Date(exam.startDate).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm py-4">No upcoming exams scheduled.</p>
              )}
            </div>

            {/* Recent Submissions */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white font-heading">Recent Submissions</h3>
              {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentSubmissions.map((sub) => (
                    <div key={sub._id} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white">{sub.examId?.title || sub.assignmentId?.title || 'Submission'}</h4>
                        <p className="text-xs text-slate-500">{sub.courseId?.title} • {sub.type}</p>
                      </div>
                      <span className={`badge ${sub.isPassed ? 'badge-success' : 'badge-primary'} px-2 py-0.5 text-xs`}>
                        {sub.score}/{sub.totalMarks}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm py-4">No recent submissions.</p>
              )}
            </div>
          </div>
        </>
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
