const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

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
  const { courseId } = req.params;
  const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

  if (isInstructorOrAdmin) {
    // Instructors/admins see all assignments (including drafts)
    const assignments = await Assignment.find({ courseId });
    return ApiResponse.success(res, 'Assignments fetched', assignments);
  }

  // Students: must be enrolled and only see published assignments
  const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
  if (!enrollment) {
    throw ApiError.forbidden('You must be enrolled in this course');
  }

  const assignments = await Assignment.find({ courseId, isPublished: true });
  ApiResponse.success(res, 'Assignments fetched', assignments);
});

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  const isInstructorOrAdmin = ['instructor', 'admin'].includes(req.user.role);

  if (!isInstructorOrAdmin) {
    // Students: must be enrolled and assignment must be published
    if (!assignment.isPublished) {
      throw ApiError.notFound('Assignment not found');
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: assignment.courseId,
    });
    if (!enrollment) {
      throw ApiError.forbidden('You must be enrolled in this course');
    }

    // Strip correct answers from MCQ questions for students
    const sanitized = assignment.toObject();
    if (sanitized.questions && sanitized.questions.length > 0) {
      sanitized.questions = sanitized.questions.map((q) => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
    }
    return ApiResponse.success(res, 'Assignment details', sanitized);
  }

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

  // 1. Check if assignment is published
  if (!assignment.isPublished) {
    throw ApiError.forbidden('This assignment is not published yet');
  }

  // 2. Check enrollment
  const enrollment = await Enrollment.findOne({
    studentId: req.user._id,
    courseId: assignment.courseId,
  });
  if (!enrollment) {
    throw ApiError.forbidden('You must be enrolled in this course');
  }

  // 3. Check due date (end of day)
  if (assignment.dueDate) {
    const deadline = new Date(assignment.dueDate);
    deadline.setHours(23, 59, 59, 999);
    if (new Date() > deadline) {
      throw ApiError.badRequest('Assignment due date has passed');
    }
  }

  // 4. Check attempt limit
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
    if (!Array.isArray(req.body.answers)) {
      throw ApiError.badRequest('Answers must be an array');
    }
    if (req.body.answers.length > assignment.questions.length) {
      throw ApiError.badRequest('Number of answers exceeds number of questions');
    }
    const questionIds = req.body.answers.map((a) => String(a.questionId));
    if (new Set(questionIds).size !== questionIds.length) {
      throw ApiError.badRequest('Duplicate question answers are not allowed');
    }
    const mongoose = require('mongoose');

    for (const answer of req.body.answers) {
      if (!answer.questionId || !mongoose.Types.ObjectId.isValid(answer.questionId)) {
        throw ApiError.badRequest('Invalid question ID');
      }
      const question = assignment.questions.id(answer.questionId);
      if (!question) {
        throw ApiError.badRequest(`Question ${answer.questionId} does not belong to this assignment`);
      }
      if (!answer.selectedOption || typeof answer.selectedOption !== 'string') {
        throw ApiError.badRequest(`Invalid answer payload for question ${question._id}`);
      }
      if (question.options && question.options.length > 0) {
        if (!question.options.includes(answer.selectedOption)) {
          throw ApiError.badRequest(`Invalid option submitted for question ${question._id}`);
        }
      }
      const isCorrect = answer.selectedOption === question.correctAnswer;
      if (isCorrect) score += Number(question.marks) || 1;
      gradedAnswers.push({ questionId: answer.questionId, selectedOption: answer.selectedOption, isCorrect });
    }
  }

  score = Math.min(score, assignment.totalMarks);
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

// @desc    Grade a submission (Instructor)
// @route   PUT /api/assignments/:id/submissions/:submissionId/grade
// @access  Private/Instructor
const gradeSubmission = asyncHandler(async (req, res) => {
  const { score, feedback, isPassed } = req.body;
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) throw ApiError.notFound('Assignment not found');

  const submission = await Submission.findOne({
    _id: req.params.submissionId,
    assignmentId: req.params.id,
  });
  if (!submission) throw ApiError.notFound('Submission does not belong to this assignment');

  const numericScore = Number(score) || 0;
  if (numericScore < 0 || numericScore > assignment.totalMarks) {
    throw ApiError.badRequest(`Grade must be between 0 and ${assignment.totalMarks}`);
  }

  submission.score = numericScore;
  submission.feedback = feedback || '';
  if (isPassed !== undefined) {
    submission.isPassed = isPassed;
  } else {
    submission.isPassed = submission.score >= assignment.passingMarks;
  }
  
  submission.percentage = submission.totalMarks > 0 ? Math.round((submission.score / submission.totalMarks) * 100 * 100) / 100 : 0;
  submission.gradedAt = new Date();
  await submission.save();

  // Create notification for student
  const { createNotification } = require('../utils/notificationHelper');
  createNotification(
    submission.studentId,
    'submission-graded',
    'Assignment Graded 📝',
    `Your submission for "${assignment.title}" has been graded. Score: ${submission.score}/${submission.totalMarks}.`,
    `/assignments/${req.params.id}/view`
  ).catch(console.error);

  ApiResponse.success(res, 'Submission graded successfully', submission);
});

module.exports = {
  createAssignment, getAssignments, getAssignment,
  updateAssignment, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission
};
