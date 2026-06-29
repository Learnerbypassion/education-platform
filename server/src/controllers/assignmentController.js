const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private/Instructor
const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.create(req.body);
  ApiResponse.created(res, 'Assignment created', assignment);
});

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find({ courseId: req.params.courseId });
  ApiResponse.success(res, 'Assignments fetched', assignments);
});

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found');
  ApiResponse.success(res, 'Assignment details', assignment);
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Instructor
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!assignment) throw ApiError.notFound('Assignment not found');
  ApiResponse.success(res, 'Assignment updated', assignment);
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Instructor
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found');
  ApiResponse.success(res, 'Assignment deleted');
});

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  // Check attempt limit
  const attemptCount = await Submission.countDocuments({
    assignmentId: req.params.id,
    studentId: req.user._id,
  });

  if (attemptCount >= assignment.maxAttempts) {
    throw ApiError.badRequest('Maximum attempts reached');
  }

  let score = 0;
  let gradedAnswers = [];

  // Auto-grade MCQ assignments
  if (assignment.type === 'mcq' && assignment.questions.length > 0) {
    gradedAnswers = (req.body.answers || []).map((answer) => {
      const question = assignment.questions.id(answer.questionId);
      const isCorrect = question && answer.selectedOption === question.correctAnswer;
      if (isCorrect) score += question.marks || 1;
      return { ...answer, isCorrect };
    });
  }

  const totalMarks = assignment.totalMarks;
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

  const submissionData = {
    studentId: req.user._id,
    assignmentId: req.params.id,
    courseId: assignment.courseId,
    type: 'assignment',
    answers: gradedAnswers.length > 0 ? gradedAnswers : req.body.answers,
    score,
    totalMarks,
    percentage: Math.round(percentage * 100) / 100,
    isPassed: score >= assignment.passingMarks,
    attemptNumber: attemptCount + 1,
    githubUrl: req.body.githubUrl || '',
    submittedAt: new Date(),
    gradedAt: assignment.type === 'mcq' ? new Date() : undefined,
  };

  // Handle file uploads
  if (req.files && req.files.length > 0) {
    submissionData.files = req.files.map((f) => ({
      name: f.originalname,
      url: `/uploads/${f.filename}`,
      type: f.mimetype,
      size: f.size,
    }));
  }

  const submission = await Submission.create(submissionData);
  ApiResponse.created(res, 'Assignment submitted', submission);
});

// @desc    Get submissions for an assignment (Instructor)
// @route   GET /api/assignments/:id/submissions
// @access  Private/Instructor
const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ assignmentId: req.params.id })
    .populate('studentId', 'name email profileImage')
    .sort({ submittedAt: -1 });
  ApiResponse.success(res, 'Submissions fetched', submissions);
});

module.exports = {
  createAssignment, getAssignments, getAssignment,
  updateAssignment, deleteAssignment, submitAssignment, getSubmissions,
};
