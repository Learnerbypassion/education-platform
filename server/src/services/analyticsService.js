const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const Certificate = require('../models/Certificate');

class AnalyticsService {
  /**
   * Get student dashboard statistics.
   */
  async getStudentStats(studentId) {
    const [enrolledCoursesCount, completedCoursesCount, certificates, submissions] = await Promise.all([
      Enrollment.countDocuments({ studentId }),
      Enrollment.countDocuments({ studentId, status: 'completed' }),
      Certificate.countDocuments({ studentId }),
      Submission.find({ studentId }).sort({ studentId }).populate('courseId', 'title').populate('examId', 'title').populate('assignmentId', 'title').sort({ submittedAt: -1 }).limit(5),
    ]);

    const recentEnrollments = await Enrollment.find({ studentId })
      .populate('courseId', 'title thumbnail category')
      .sort({ enrolledAt: -1 })
      .limit(5);

    const enrolledCourses = await Enrollment.find({ studentId }).select('courseId');
    const courseIds = enrolledCourses.map((e) => e.courseId);

    const Exam = require('../models/Exam');
    const upcomingExams = await Exam.find({
      courseId: { $in: courseIds },
      isPublished: true,
      startDate: { $gt: new Date() },
    })
      .populate('courseId', 'title')
      .sort({ startDate: 1 })
      .limit(5);

    return {
      enrolledCourses: enrolledCoursesCount,
      completedCourses: completedCoursesCount,
      certificates,
      inProgressCourses: enrolledCoursesCount - completedCoursesCount,
      recentEnrollments,
      recentSubmissions: submissions,
      upcomingExams,
    };
  }

  /**
   * Get instructor dashboard statistics.
   */
  async getInstructorStats(instructorId) {
    const courses = await Course.find({ creatorId: instructorId });
    const courseIds = courses.map((c) => c._id);

    const [totalStudents, totalSubmissions, recentSubmissions] = await Promise.all([
      Enrollment.countDocuments({ courseId: { $in: courseIds } }),
      Submission.countDocuments({ courseId: { $in: courseIds } }),
      Submission.find({ courseId: { $in: courseIds } })
        .populate('studentId', 'name email')
        .populate('courseId', 'title')
        .populate('examId', 'title')
        .populate('assignmentId', 'title')
        .sort({ submittedAt: -1 })
        .limit(15),
    ]);

    // Per-course stats
    const courseStats = await Promise.all(
      courses.map(async (course) => {
        const students = await Enrollment.countDocuments({ courseId: course._id });
        const avgScore = await Submission.aggregate([
          { $match: { courseId: course._id, type: 'exam' } },
          { $group: { _id: null, avg: { $avg: '$percentage' } } },
        ]);

        return {
          courseId: course._id,
          title: course.title,
          students,
          averageScore: avgScore[0]?.avg || 0,
        };
      })
    );

    return {
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.isPublished).length,
      totalStudents,
      totalSubmissions,
      recentSubmissions,
      courseStats,
    };
  }

  /**
   * Get admin dashboard statistics.
   */
  async getAdminStats() {
    const [totalUsers, totalCourses, totalEnrollments, totalCertificates] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Certificate.countDocuments(),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const coursesByCategory = await Course.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      usersByRole,
      coursesByCategory,
      recentUsers,
    };
  }
}

module.exports = new AnalyticsService();
