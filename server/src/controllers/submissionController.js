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
    .populate('courseId', 'title')
    .populate('examId', 'title')
    .populate('assignmentId', 'title');

  if (!submission) {
    throw require('../utils/ApiError').notFound('Submission not found');
  }

  ApiResponse.success(res, 'Submission details', submission);
});

module.exports = { getMySubmissions, getSubmission };
