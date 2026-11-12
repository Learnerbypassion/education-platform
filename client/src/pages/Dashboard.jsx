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
      toast.success(res.data.data.isPublished ? 'Course published live' : 'Course moved to draft');
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
      instructorResponse = window.prompt('Enter optional feedback for student:') || '';
    }

    try {
      await updateAttemptRequestStatus(requestId, { status, instructorResponse });
      toast.success(`Request ${status} successfully`);
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
        let statsRes;
        if (isAdmin) statsRes = await getAdminStats();
        else if (isInstructor) statsRes = await getInstructorStats();
        else statsRes = await getStudentStats();
        setStats(statsRes.data.data);

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

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader text="Loading workspace..." /></div>;

  // Render Enrolled Courses
  if (tab === 'enrolled') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-6 shadow-xs">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enrolled Courses</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Continue your active coursework and progress toward certification.</p>
        </div>
        {coursesList.length === 0 ? (
          <div className="empty-state-card py-16">
            <div className="empty-state-icon-box">
              <HiOutlineBookOpen size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No enrolled courses</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">You are not currently enrolled in any courses.</p>
            <Link to="/courses" className="btn btn-primary mt-4 px-4 py-2 text-xs font-semibold">Browse Course Catalog</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesList.map((enrollment) => (
              <div key={enrollment._id} className="space-y-3">
                <CourseCard course={enrollment.courseId} />
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-3 shadow-xs">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Curriculum Progress</span>
                    <span className="text-slate-900 dark:text-white">{enrollment.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-slate-900 dark:bg-white transition-all duration-300" style={{ width: `${enrollment.progress}%` }} />
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
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-6 shadow-xs">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Created Courses</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage syllabus content, edit lesson modules, and publish live.</p>
          </div>
          <Link to="/course/create" className="btn btn-primary px-4 py-2 text-xs font-semibold whitespace-nowrap self-start sm:self-auto">
            Create New Course
          </Link>
        </div>
        {coursesList.length === 0 ? (
          <div className="empty-state-card py-16">
            <div className="empty-state-icon-box">
              <HiOutlineDocumentText size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No courses created</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">Begin by authoring your first curriculum module.</p>
            <Link to="/course/create" className="btn btn-primary mt-4 px-4 py-2 text-xs font-semibold">Create First Course</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesList.map((course) => (
              <div key={course._id} className="space-y-3">
                <CourseCard course={course} />
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] flex items-center justify-between p-3 shadow-xs">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    course.isPublished 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {course.isPublished ? 'Live' : 'Draft'}
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      type="button" 
                      className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
                      onClick={() => handleTogglePublish(course._id)}
                    >
                      {course.isPublished ? (
                        <>
                          <HiOutlineEyeOff size={13} /> Unpublish
                        </>
                      ) : (
                        <>
                          <HiOutlineGlobeAlt size={13} /> Publish
                        </>
                      )}
                    </button>

                    <Link 
                      to={`/course/${course._id}/edit`} 
                      className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <HiOutlinePencil size={12} /> Edit
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
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-6 shadow-xs">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Attempt Requests</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review student requests for additional assessment attempts.</p>
        </div>
        {attemptRequests.length === 0 ? (
          <div className="empty-state-card py-16">
            <div className="empty-state-icon-box">
              <HiOutlineClipboardCheck size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No pending requests</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">There are no outstanding student exam attempt requests.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Course / Exam</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Reason</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attemptRequests.map((reqItem) => (
                    <tr key={reqItem._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{reqItem.studentId?.name}</div>
                        <div className="text-[11px] text-slate-400">{reqItem.studentId?.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{reqItem.examId?.title}</div>
                        <div className="text-[11px] text-slate-400">{reqItem.courseId?.title}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {reqItem.message || <span className="italic text-slate-400">None provided</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          reqItem.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : reqItem.status === 'rejected' 
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' 
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {reqItem.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {reqItem.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleReviewRequest(reqItem._id, 'approved')}
                              className="px-2.5 py-1 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                              Approve (+2)
                            </button>
                            <button
                              onClick={() => handleReviewRequest(reqItem._id, 'rejected')}
                              className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">Resolved</span>
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
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-6 shadow-xs">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Metrics</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Student enrollment volume and average assessment scores.</p>
        </div>

        {stats?.courseStats?.length === 0 ? (
          <div className="empty-state-card py-16">
            <div className="empty-state-icon-box">
              <HiOutlineChartBar size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No performance data</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">Course analytics will display once students begin active coursework.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-5 py-3 font-semibold uppercase tracking-wider">Course Title</th>
                      <th className="px-5 py-3 font-semibold uppercase tracking-wider">Students Enrolled</th>
                      <th className="px-5 py-3 font-semibold uppercase tracking-wider">Average Exam Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats?.courseStats?.map((c) => (
                      <tr key={c.courseId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{c.title}</td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{c.students} students</td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-medium text-slate-900 dark:text-white">
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
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-5 shadow-xs">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Student Submissions</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Individual results for exam and assignment assessments.</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-5 py-3 font-semibold uppercase tracking-wider">Student</th>
                          <th className="px-5 py-3 font-semibold uppercase tracking-wider">Course</th>
                          <th className="px-5 py-3 font-semibold uppercase tracking-wider">Assessment</th>
                          <th className="px-5 py-3 font-semibold uppercase tracking-wider">Type</th>
                          <th className="px-5 py-3 font-semibold uppercase tracking-wider">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {stats?.recentSubmissions?.map((s) => (
                          <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-slate-900 dark:text-white">{s.studentId?.name}</div>
                              <div className="text-[11px] text-slate-400">{s.studentId?.email}</div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{s.courseId?.title}</td>
                            <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                              {s.examId?.title || s.assignmentId?.title || 'Submission'}
                            </td>
                            <td className="px-5 py-3.5 capitalize text-slate-500">{s.type}</td>
                            <td className="px-5 py-3.5">
                              {s.type === 'exam' ? (
                                <span className={`font-mono font-medium ${s.isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {s.score}/{s.totalMarks} ({s.percentage}%)
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium">Submitted</span>
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
          </div>
        )}
      </div>
    );
  }

  // Fallback / Overview Tab
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Workspace Overview</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Summary of your current academic coursework and platform activities.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 self-start md:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
          <span>{user?.role}</span>
        </div>
      </div>

      {!isInstructor && !isAdmin && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard icon={<HiOutlineBookOpen />} label="Enrolled Courses" value={stats.enrolledCourses || 0} />
            <StatsCard icon={<HiOutlineClipboardCheck />} label="Completed Courses" value={stats.completedCourses || 0} />
            <StatsCard icon={<HiOutlineChartBar />} label="In Progress" value={stats.inProgressCourses || 0} />
            <StatsCard icon={<HiOutlineAcademicCap />} label="Certificates Earned" value={stats.certificates || 0} />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Upcoming Exams */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-5 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Upcoming Examinations
              </h3>
              {stats.upcomingExams && stats.upcomingExams.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingExams.map((exam) => (
                    <div key={exam._id} className="border-b border-slate-100 dark:border-slate-850 pb-3 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs">{exam.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{exam.courseId?.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        Scheduled: {new Date(exam.startDate).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No exams currently scheduled.</div>
              )}
            </div>

            {/* Recent Submissions */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-5 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Recent Submissions
              </h3>
              {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentSubmissions.map((sub) => (
                    <div key={sub._id} className="border-b border-slate-100 dark:border-slate-850 pb-3 last:border-0 last:pb-0 flex justify-between items-center gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs">{sub.examId?.title || sub.assignmentId?.title || 'Submission'}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sub.courseId?.title} • <span className="capitalize">{sub.type}</span></p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {sub.score}/{sub.totalMarks}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">No recent submissions found.</div>
              )}
            </div>
          </div>
        </>
      )}

      {isInstructor && !isAdmin && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard icon={<HiOutlineBookOpen />} label="Total Courses" value={stats.totalCourses || 0} />
          <StatsCard icon={<HiOutlineDocumentText />} label="Published Courses" value={stats.publishedCourses || 0} />
          <StatsCard icon={<HiOutlineUsers />} label="Total Students" value={stats.totalStudents || 0} />
          <StatsCard icon={<HiOutlineClipboardCheck />} label="Total Submissions" value={stats.totalSubmissions || 0} />
        </div>
      )}

      {isAdmin && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard icon={<HiOutlineUsers />} label="Registered Users" value={stats.totalUsers || 0} />
          <StatsCard icon={<HiOutlineBookOpen />} label="Platform Courses" value={stats.totalCourses || 0} />
          <StatsCard icon={<HiOutlineClipboardCheck />} label="Total Enrollments" value={stats.totalEnrollments || 0} />
          <StatsCard icon={<HiOutlineAcademicCap />} label="Issued Certificates" value={stats.totalCertificates || 0} />
        </div>
      )}

      {/* Instructor's Created Courses quick section */}
      {(isInstructor || isAdmin) && coursesList.length > 0 && (
        <div className="space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Course Catalog & Visibility
            </h2>
            <Link to="/dashboard?tab=courses" className="text-xs font-semibold text-slate-900 dark:text-white hover:underline">
              View All ({coursesList.length}) →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesList.slice(0, 3).map((course) => (
              <div key={course._id} className="space-y-3">
                <CourseCard course={course} />
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] flex items-center justify-between p-3 shadow-xs">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    course.isPublished 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {course.isPublished ? 'Live' : 'Draft'}
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      type="button" 
                      className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer" 
                      onClick={() => handleTogglePublish(course._id)}
                    >
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>

                    <Link 
                      to={`/course/${course._id}/edit`} 
                      className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick navigation actions */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11131c] p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace Shortcuts</h2>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {isInstructor || isAdmin ? (
            <>
              <Link to="/course/create" className="btn btn-primary px-4 py-2 text-xs font-semibold">
                Create Course
              </Link>
              <Link to="/courses" className="btn btn-outline px-4 py-2 text-xs font-medium">
                Explore Courses
              </Link>
              <Link to="/dashboard?tab=exam-requests" className="btn btn-outline px-4 py-2 text-xs font-medium">
                Attempt Requests
              </Link>
            </>
          ) : (
            <>
              <Link to="/courses" className="btn btn-primary px-4 py-2 text-xs font-semibold">
                Browse Courses
              </Link>
              <Link to="/dashboard?tab=enrolled" className="btn btn-outline px-4 py-2 text-xs font-medium">
                My Enrolled Courses
              </Link>
              <Link to="/verify" className="btn btn-outline px-4 py-2 text-xs font-medium">
                Verify Credentials
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
