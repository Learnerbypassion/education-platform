const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');

class CourseService {
  /**
   * Create a new course.
   */
  async createCourse(data, creatorId) {
    const course = await Course.create({ ...data, creatorId });
    return course;
  }

  /**
   * Get all published courses with filters.
   */
  async getCourses(filters = {}, page = 1, limit = 12) {
    const query = { isPublished: true };

    if (filters.category) query.category = filters.category;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const skip = (page - 1) * limit;
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('creatorId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get full course details with modules and lessons.
   */
  async getCourseById(courseId) {
    const course = await Course.findById(courseId)
      .populate('creatorId', 'name profileImage bio');

    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const modules = await Module.find({ courseId })
      .sort({ order: 1 });

    const lessons = await Lesson.find({ courseId })
      .sort({ order: 1 });

    // Group lessons by module
    const modulesWithLessons = modules.map((mod) => ({
      ...mod.toObject(),
      lessons: lessons.filter((l) => l.moduleId.toString() === mod._id.toString()),
    }));

    return {
      ...course.toObject(),
      modules: modulesWithLessons,
    };
  }

  /**
   * Enroll a student in a course.
   */
  async enrollStudent(studentId, courseId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Course not found');
    }

    const existing = await Enrollment.findOne({ studentId, courseId });
    if (existing) {
      throw ApiError.conflict('Already enrolled in this course');
    }

    const enrollment = await Enrollment.create({ studentId, courseId });

    // Increment enrollment count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    return enrollment;
  }

  /**
   * Get courses created by an instructor.
   */
  async getInstructorCourses(creatorId) {
    return Course.find({ creatorId }).sort({ createdAt: -1 });
  }

  /**
   * Get courses enrolled by a student.
   */
  async getEnrolledCourses(studentId) {
    const enrollments = await Enrollment.find({ studentId })
      .populate({
        path: 'courseId',
        populate: { path: 'creatorId', select: 'name profileImage' },
      })
      .sort({ enrolledAt: -1 });

    return enrollments;
  }
}

module.exports = new CourseService();
