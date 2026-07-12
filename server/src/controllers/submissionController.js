const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Submission = require('../models/Submission');

// @desc    Get all submissions for a student
// @route   GET /api/submissions/me
// @access  Private/Student
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ studentId: req.user._id })
    .populate('courseId', 'title')
    .populate('examId', 'title')
    .populate('assignmentId', 'title')
    .sort({ submittedAt: -1 });

  ApiResponse.success(res, 'Submissions fetched', submissions);
});

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('courseId', 'title creatorId')
    .populate('examId', 'title')
    .populate('assignmentId', 'title');

  const ApiError = require('../utils/ApiError');
  if (!submission) {
    throw ApiError.notFound('Submission not found');
  }

  const Course = require('../models/Course');
  const course = await Course.findById(submission.courseId?._id || submission.courseId);

  const studentId = submission.studentId?._id?.toString() || submission.studentId?.toString();
  const isOwner = studentId === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  let isInstructorOwner = false;

  if (req.user.role === 'instructor' && course) {
    isInstructorOwner = course.creatorId.toString() === req.user._id.toString();
  }

  if (!isOwner && !isAdmin && !isInstructorOwner) {
    throw ApiError.forbidden('You are not authorized to access this submission');
  }

  ApiResponse.success(res, 'Submission details', submission);
});

module.exports = { getMySubmissions, getSubmission };
