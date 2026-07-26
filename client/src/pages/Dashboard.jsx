import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StatsCard from '../components/dashboard/StatsCard';
import Loader from '../components/common/Loader';
import CourseCard from '../components/course/CourseCard';
import { getStudentStats, getInstructorStats, getAdminStats } from '../api/analyticsApi';
import { getEnrolledCourses, getInstructorCourses, togglePublish } from '../api/courseApi';
import { getInstructorAttemptRequests, updateAttemptRequestStatus } from '../api/examApi';
import { HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineClipboardCheck, HiOutlineUsers, HiOutlineChartBar, HiOutlineDocumentText, HiOutlineGlobeAlt, HiOutlineEyeOff, HiOutlinePencil } from 'react-icons/hi';
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
        } else if (tab === 'courses' || (!tab && (isInstructor || isAdmin))) {
          const res = await getInstructorCourses();
          setCoursesList(res.data.data || []);
        }
        
        if (tab === 'exam-requests') {
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
        <div className="glass-card p-8 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">Enrolled <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">courses</span></h1>
          <p className="mt-2.5 text-sm text-slate-550 dark:text-slate-400 font-medium">Resume your learning journey where you left off.</p>
        </div>
        {coursesList.length === 0 ? (
          <div className="empty-state-card animate-slide-up">
            <div className="empty-state-icon-box">
              <HiOutlineBookOpen size={36} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">No enrolled courses</h3>
            <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 font-medium">You haven't started any courses yet.</p>
            <Link to="/courses" className="btn btn-primary mt-6 px-6 max-w-xs">Browse Catalog</Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 animate-slide-up">
            {coursesList.map((enrollment) => (
              <div key={enrollment._id} className="space-y-4 hover:-translate-y-1 transition-all duration-300">
                <CourseCard course={enrollment.courseId} />
                <div className="glass-card p-5 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl">
                  <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                    <span>Progress</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{enrollment.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/[0.05] overflow-hidden shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" style={{ width: `${enrollment.progress}%` }} />
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
        <div className="flex flex-col justify-between gap-6 glass-card p-8 sm:flex-row sm:items-center border border-slate-200/80 dark:border-white/[0.04] rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="space-y-1.5">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">My created <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">courses</span></h1>
            <p className="text-sm text-slate-550 dark:text-slate-400 font-medium">Manage, edit, and publish your content.</p>
          </div>
          <Link to="/course/create" className="btn-detail-primary sm:w-auto px-6 whitespace-nowrap">Create Course</Link>
        </div>
        {coursesList.length === 0 ? (
          <div className="empty-state-card animate-slide-up">
            <div className="empty-state-icon-box">
              <HiOutlineDocumentText size={36} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">No courses created yet</h3>
            <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 font-medium">Share your knowledge with the world.</p>
            <Link to="/course/create" className="btn btn-primary mt-6 px-6 max-w-xs">Create Your First Course</Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 animate-slide-up">
            {coursesList.map((course) => (
              <div key={course._id} className="space-y-4 hover:-translate-y-1 transition-all duration-300">
                <CourseCard course={course} />
                <div className="glass-card flex items-center justify-between p-4 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl">
                  <span className={`inline-flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border ${
                    course.isPublished 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        course.isPublished ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        course.isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                    </span>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                        course.isPublished 
                          ? 'border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20'
                      }`} 
                      onClick={() => handleTogglePublish(course._id)}
                    >
                      {course.isPublished ? (
                        <>
                          <HiOutlineEyeOff size={14} /> Unpublish
                        </>
                      ) : (
                        <>
                          <HiOutlineGlobeAlt size={14} /> Publish
                        </>
                      )}
                    </button>

                    <Link 
                      to={`/course/${course._id}/edit`} 
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 text-xs font-bold transition-all duration-300 flex items-center gap-1"
                    >
                      <HiOutlinePencil size={13} /> Edit
                    </Link>
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
        <div className="glass-card p-8 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">Exam Attempt <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">requests</span></h1>
          <p className="mt-2.5 text-sm text-slate-550 dark:text-slate-400 font-medium">Approve or reject student requests for extra exam attempts.</p>
        </div>
        {attemptRequests.length === 0 ? (
          <div className="empty-state-card animate-slide-up">
            <div className="empty-state-icon-box">
              <HiOutlineClipboardCheck size={36} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">No attempt requests</h3>
            <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 font-medium">There are currently no requests for extra exam attempts.</p>
          </div>
        ) : (
          <div className="bg-white/40 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50/50 dark:bg-white/[0.01] text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Course / Exam</th>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.02]">
                  {attemptRequests.map((reqItem) => (
                    <tr key={reqItem._id} className="hover:bg-indigo-50/10 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 max-w-[150px] truncate" title={reqItem.studentId?.name}>{reqItem.studentId?.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate" title={reqItem.studentId?.email}>{reqItem.studentId?.email}</div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="font-semibold text-slate-700 dark:text-slate-300 max-w-[150px] truncate" title={reqItem.examId?.title}>{reqItem.examId?.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate" title={reqItem.courseId?.title}>{reqItem.courseId?.title}</div>
                      </td>
                      <td className="px-6 py-4.5 text-slate-600 dark:text-slate-350">
                        <div className="max-w-[200px] truncate" title={reqItem.message}>
                          {reqItem.message || <span className="text-slate-400 dark:text-slate-500 italic text-xs font-medium">No reason provided</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`badge border font-bold text-[10px] uppercase tracking-wider px-3 py-1 ${
                          reqItem.status === 'approved' 
                            ? 'bg-emerald-100/80 text-emerald-800 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-500/10' 
                            : reqItem.status === 'rejected' 
                            ? 'bg-rose-100/80 text-rose-850 border-rose-200/50 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-500/10' 
                            : 'bg-amber-100/80 text-amber-805 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-500/10'
                        }`}>
                          {reqItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        {reqItem.status === 'pending' ? (
                          <div className="flex justify-end gap-2.5">
                            <button
                              onClick={() => handleReviewRequest(reqItem._id, 'approved')}
                              className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95 transition-all duration-300 text-xs font-bold px-3.5 py-1.5"
                            >
                              Approve (+2)
                            </button>
                            <button
                              onClick={() => handleReviewRequest(reqItem._id, 'rejected')}
                              className="rounded-xl text-rose-650 hover:bg-rose-500 hover:text-white border border-rose-250 hover:border-transparent transition-all duration-300 text-xs font-bold px-3.5 py-1.5"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
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
        <div className="glass-card p-8 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">Course <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">performance</span></h1>
          <p className="mt-2.5 text-sm text-slate-550 dark:text-slate-400 font-medium">Real-time statistics on enrollment and exam scores.</p>
        </div>

        {stats?.courseStats?.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center px-8 py-20 text-center animate-slide-up border border-slate-200/80 dark:border-white/[0.04] rounded-2xl">
            <div className="rounded-full bg-indigo-50 dark:bg-white/[0.03] p-6 text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
              <HiOutlineChartBar size={56} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">No performance data available</h3>
          </div>
        ) : (
          <>
            <div className="bg-white/40 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm animate-slide-up">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50/50 dark:bg-white/[0.01] text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-white/[0.03]">
                    <tr>
                      <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Course Title</th>
                      <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Students Enrolled</th>
                      <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Average Exam Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.02]">
                    {stats?.courseStats?.map((c) => (
                      <tr key={c.courseId} className="hover:bg-indigo-50/10 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 py-4.5">
                          <div className="font-bold text-slate-800 dark:text-slate-200 max-w-[250px] truncate" title={c.title}>{c.title}</div>
                        </td>
                        <td className="px-6 py-4.5 font-semibold text-slate-600 dark:text-slate-350">{c.students} students</td>
                        <td className="px-6 py-4.5">
                          <span className="badge border bg-emerald-100/85 text-emerald-800 border-emerald-250/20 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-500/10 font-bold px-4 py-1.5 text-xs tracking-wider rounded-xl">
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
                <div className="glass-card p-6 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">Recent student <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">submissions</span></h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Track individual grades for exams and assignments.</p>
                </div>
                <div className="bg-white/40 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50/50 dark:bg-white/[0.01] text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-white/[0.03]">
                        <tr>
                          <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Student</th>
                          <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Course</th>
                          <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Activity / Assessment</th>
                          <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4.5 text-xs font-bold uppercase tracking-wider">Score / Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/50 dark:divide-white/[0.02]">
                        {stats?.recentSubmissions?.map((s) => (
                          <tr key={s._id} className="hover:bg-indigo-50/10 dark:hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4.5">
                              <div className="font-bold text-slate-800 dark:text-slate-200 max-w-[150px] truncate" title={s.studentId?.name}>{s.studentId?.name}</div>
                              <div className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate" title={s.studentId?.email}>{s.studentId?.email}</div>
                            </td>
                            <td className="px-6 py-4.5 font-semibold text-slate-655 dark:text-slate-350">
                              <div className="max-w-[150px] truncate" title={s.courseId?.title}>{s.courseId?.title}</div>
                            </td>
                            <td className="px-6 py-4.5 font-bold text-slate-700 dark:text-slate-300">
                              <div className="max-w-[150px] truncate" title={s.examId?.title || s.assignmentId?.title || 'Quiz / Submission'}>
                                {s.examId?.title || s.assignmentId?.title || 'Quiz / Submission'}
                              </div>
                            </td>
                            <td className="px-6 py-4.5 capitalize text-slate-505 font-medium text-xs">{s.type}</td>
                            <td className="px-6 py-4.5">
                              {s.type === 'exam' ? (
                                <span className={`badge border font-bold text-xs px-3.5 py-1 rounded-xl ${
                                  s.isPassed 
                                    ? 'bg-emerald-100/80 text-emerald-800 border-emerald-250/20 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-500/10' 
                                    : 'bg-rose-100/80 text-rose-850 border-rose-250/20 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-500/10'
                                }`}>
                                  {s.score} / {s.totalMarks} ({s.percentage}%)
                                </span>
                              ) : (
                                <span className="badge border bg-indigo-50/80 text-indigo-700 border-indigo-100/50 dark:bg-white/[0.04] dark:text-slate-300 dark:border-white/10 px-3.5 py-1 rounded-xl text-xs font-bold font-heading">Submitted</span>
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
      <div className="glass-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl relative overflow-hidden">
        {/* Subtle internal glowing orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="space-y-1.5">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{user?.name}</span>
          </h1>
          <p className="text-sm text-slate-550 dark:text-slate-400 font-medium">Here's what's happening with your learning journey today.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50/50 px-4.5 py-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-white/[0.03] dark:text-indigo-400 border border-indigo-150 dark:border-white/10 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse"></span>
          {user?.role}
        </div>
      </div>

      {!isInstructor && !isAdmin && stats && (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-slide-up">
            <StatsCard icon={<HiOutlineBookOpen />} label="Enrolled Courses" value={stats.enrolledCourses || 0} color="#6b7aff" />
            <StatsCard icon={<HiOutlineClipboardCheck />} label="Completed" value={stats.completedCourses || 0} color="#10b981" />
            <StatsCard icon={<HiOutlineChartBar />} label="In Progress" value={stats.inProgressCourses || 0} color="#f59e0b" />
            <StatsCard icon={<HiOutlineAcademicCap />} label="Certificates" value={stats.certificates || 0} color="#f43f5e" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-slide-up mt-6">
            {/* Upcoming Exams */}
            <div className="glass-card p-6 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2 text-slate-900 dark:text-white font-heading">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span> Upcoming Exams
              </h3>
              {stats.upcomingExams && stats.upcomingExams.length > 0 ? (
                <div className="space-y-4">
                  {stats.upcomingExams.map((exam) => (
                    <div key={exam._id} className="border-b border-slate-100 dark:border-white/[0.03] pb-3.5 last:border-0 last:pb-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{exam.title}</h4>
                      <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mt-0.5">{exam.courseId?.title}</p>
                      <p className="text-[11px] text-rose-555 dark:text-rose-455 font-bold mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500/20 dark:bg-rose-405/20" />
                        Starts: {new Date(exam.startDate).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm font-medium">No upcoming exams scheduled.</div>
              )}
            </div>

            {/* Recent Submissions */}
            <div className="glass-card p-6 border border-slate-200/80 dark:border-white/[0.04] rounded-2xl">
              <h3 className="text-lg font-bold mb-5 text-slate-900 dark:text-white font-heading">Recent Submissions</h3>
              {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentSubmissions.map((sub) => (
                    <div key={sub._id} className="border-b border-slate-100 dark:border-white/[0.03] pb-3.5 last:border-0 last:pb-0 flex justify-between items-center gap-4">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{sub.examId?.title || sub.assignmentId?.title || 'Submission'}</h4>
                        <p className="text-xs text-slate-505 dark:text-slate-400 font-medium mt-0.5">{sub.courseId?.title} • <span className="capitalize">{sub.type}</span></p>
                      </div>
                      <span className={`badge ${sub.isPassed ? 'badge-success' : 'badge-primary'} px-2.5 py-1 text-[11px] font-bold`}>
                        {sub.score}/{sub.totalMarks}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm font-medium">No recent submissions.</div>
              )}
            </div>
          </div>
        </>
      )}

      {isInstructor && !isAdmin && stats && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-slide-up">
          <StatsCard icon={<HiOutlineBookOpen />} label="Total Courses" value={stats.totalCourses || 0} color="#6b7aff" />
          <StatsCard icon={<HiOutlineDocumentText />} label="Published" value={stats.publishedCourses || 0} color="#10b981" />
          <StatsCard icon={<HiOutlineUsers />} label="Total Students" value={stats.totalStudents || 0} color="#3b82f6" />
          <StatsCard icon={<HiOutlineClipboardCheck />} label="Submissions" value={stats.totalSubmissions || 0} color="#f59e0b" />
        </div>
      )}

      {isAdmin && stats && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-slide-up">
          <StatsCard icon={<HiOutlineUsers />} label="Total Users" value={stats.totalUsers || 0} color="#6b7aff" />
          <StatsCard icon={<HiOutlineBookOpen />} label="Total Courses" value={stats.totalCourses || 0} color="#10b981" />
          <StatsCard icon={<HiOutlineClipboardCheck />} label="Enrollments" value={stats.totalEnrollments || 0} color="#3b82f6" />
          <StatsCard icon={<HiOutlineAcademicCap />} label="Certificates" value={stats.totalCertificates || 0} color="#f43f5e" />
        </div>
      )}

      {/* Instructor's Created Courses & Quick Publish Controls */}
      {(isInstructor || isAdmin) && coursesList.length > 0 && (
        <div className="space-y-4 animate-slide-up mt-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                My Created Courses & Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Publish or unpublish your courses to control student access.
              </p>
            </div>
            <Link to="/dashboard?tab=courses" className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All Courses ({coursesList.length}) →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {coursesList.map((course) => (
              <div key={course._id} className="space-y-3">
                <CourseCard course={course} />
                <div className="glass-card flex items-center justify-between p-3.5 border border-slate-200/80 dark:border-white/[0.06] rounded-2xl">
                  <span className={`inline-flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border ${
                    course.isPublished 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        course.isPublished ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        course.isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}></span>
                    </span>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                        course.isPublished 
                          ? 'border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20'
                      }`} 
                      onClick={() => handleTogglePublish(course._id)}
                    >
                      {course.isPublished ? (
                        <>
                          <HiOutlineEyeOff size={14} /> Unpublish
                        </>
                      ) : (
                        <>
                          <HiOutlineGlobeAlt size={14} /> Publish Course Live
                        </>
                      )}
                    </button>

                    <Link 
                      to={`/course/${course._id}/edit`} 
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 text-xs font-bold transition-all duration-300 flex items-center gap-1"
                    >
                      <HiOutlinePencil size={13} /> Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-8 animate-slide-up border border-slate-200/80 dark:border-white/[0.04] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">Quick actions</h2>
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          {isInstructor || isAdmin ? (
            <>
              <Link to="/course/create" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-2">
                <HiOutlineDocumentText size={18} /> Create Course
              </Link>
              <Link to="/courses" className="px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-extrabold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-2">
                <HiOutlineBookOpen size={18} /> View All Courses
              </Link>
            </>
          ) : (
            <>
              <Link to="/courses" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-2">
                <HiOutlineBookOpen size={18} /> Browse Courses
              </Link>
              <Link to="/verify" className="px-6 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-extrabold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-2">
                <HiOutlineAcademicCap size={18} /> Verify Certificate
              </Link>
              <Link to="/dashboard?tab=enrolled" className="px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-extrabold text-sm shadow-sm hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-2">
                <HiOutlineClipboardCheck size={18} /> My Courses
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
