const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Reusable middleware to verify that the logged-in user owns the course
 * associated with the targeted resource, or is an admin.
 *
 * @param {string} resourceType - 'course', 'module', 'lesson', 'assignment', 'exam'
 * @param {string} idSource - 'params' or 'body'
 */
const checkCourseOwnership = (resourceType, idSource = 'params') => {
  return asyncHandler(async (req, res, next) => {
    // If admin, bypass ownership checks
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    let courseId = null;
    const bodyOrParams = idSource === 'body' ? req.body : req.params;

    try {
      switch (resourceType.toLowerCase()) {
        case 'course': {
          // Can be courseId or id
          courseId = bodyOrParams.courseId || bodyOrParams.id;
          break;
        }
        case 'module': {
          const moduleId = bodyOrParams.moduleId || bodyOrParams.id;
          if (moduleId) {
            const mod = await Module.findById(moduleId);
            if (mod) courseId = mod.courseId;
          }
          break;
        }
        case 'lesson': {
          const lessonId = bodyOrParams.lessonId || bodyOrParams.id;
          if (lessonId) {
            const lesson = await Lesson.findById(lessonId);
            if (lesson) courseId = lesson.courseId;
          }
          break;
        }
        case 'assignment': {
          const assignmentId = bodyOrParams.assignmentId || bodyOrParams.id;
          if (assignmentId) {
            const assignment = await Assignment.findById(assignmentId);
            if (assignment) courseId = assignment.courseId;
          }
          break;
        }
        case 'exam': {
          const examId = bodyOrParams.examId || bodyOrParams.id;
          if (examId) {
            const exam = await Exam.findById(examId);
            if (exam) courseId = exam.courseId;
          }
          break;
        }
        default:
          throw ApiError.internal('Invalid resource type in ownership check');
      }
    } catch (err) {
      throw ApiError.badRequest('Invalid resource reference');
    }

    if (!courseId) {
      throw ApiError.notFound('Associated course not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw ApiError.notFound('Associated course not found');
    }

    // Verify creator ownership
    if (course.creatorId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You are not authorized to modify resources for this course');
    }

    next();
  });
};

module.exports = { checkCourseOwnership };
