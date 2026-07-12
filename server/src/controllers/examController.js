const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const examService = require('../services/examService');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Submission = require('../models/Submission');

// @desc    Create exam
// @route   POST /api/exams
// @access  Private/Instructor
const createExam = asyncHandler(async (req, res) => {
  const { questions, ...examData } = req.body;
  const exam = await examService.createExam(examData, questions, req.user._id);
  ApiResponse.created(res, 'Exam created', exam);
});

// @desc    Get exams for a course
// @route   GET /api/exams/course/:courseId
// @access  Private
const getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ courseId: req.params.courseId });

  if (req.user.role === 'student') {
    const examsWithAttemptStatus = await Promise.all(
      exams.map(async (exam) => {
        const attemptStatus = await examService.getAttemptStatus(exam._id, req.user._id);
        return {
          ...exam.toObject(),
          attemptsUsed: attemptStatus.attemptsUsed,
          totalAllowedAttempts: attemptStatus.totalAllowedAttempts,
          attemptsLeft: attemptStatus.attemptsLeft,
          hasPendingRequest: attemptStatus.hasPendingRequest,
          requestStatus: attemptStatus.requestStatus,
        };
      })
    );
    return ApiResponse.success(res, 'Exams fetched', examsWithAttemptStatus);
  }

  ApiResponse.success(res, 'Exams fetched', exams);
});

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Private
const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw ApiError.notFound('Exam not found');

  const Course = require('../models/Course');
  const course = await Course.findById(exam.courseId);
  if (!course) throw ApiError.notFound('Associated course not found');

  let hasFullAccess = false;
  if (req.user.role === 'admin') {
    hasFullAccess = true;
  } else if (req.user.role === 'instructor') {
    if (course.creatorId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('Not authorized to access this exam');
    }
    hasFullAccess = true;
  } else if (req.user.role === 'student') {
    if (!exam.isPublished) {
      throw ApiError.notFound('Exam not found');
    }
    const Enrollment = require('../models/Enrollment');
    const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId: course._id });
    if (!enrollment) {
      throw ApiError.forbidden('You must be enrolled in this course');
    }
  } else {
    throw ApiError.forbidden('Not authorized');
  }

  const questions = await Question.find({ examId: exam._id }).sort({ order: 1 });

  if (hasFullAccess) {
    return ApiResponse.success(res, 'Exam details', { ...exam.toObject(), questions });
  }

  const sanitizedQuestions = questions.map((question) => ({
    _id: question._id,
    type: question.type,
    text: question.text,
    marks: question.marks,
    options: question.options?.map((option) => ({
      _id: option._id,
      text: option.text,
    })),
  }));

  ApiResponse.success(res, 'Exam details', { ...exam.toObject(), questions: sanitizedQuestions });
});

// @desc    Start / get exam for student (no correct answers)
// @route   GET /api/exams/:id/take
// @access  Private/Student
const takeExam = asyncHandler(async (req, res) => {
  const result = await examService.getExamForStudent(req.params.id, req.user._id);
  ApiResponse.success(res, 'Exam loaded', result);
});

// @desc    Submit exam
// @route   POST /api/exams/:id/submit
// @access  Private/Student
const submitExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw ApiError.notFound('Exam not found');

  const submission = await examService.submitExam(
    req.params.id,
    req.user._id,
    exam.courseId,
    req.body.answers,
    req.body.timeSpent
  );

  ApiResponse.created(res, 'Exam submitted', submission);
});

// @desc    Get exam results for student
// @route   GET /api/exams/:id/results
// @access  Private/Student
const getExamResults = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    examId: req.params.id,
    studentId: req.user._id,
    type: 'exam',
  }).sort({ submittedAt: -1 });

  ApiResponse.success(res, 'Exam results', submissions);
});

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Instructor
const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!exam) throw ApiError.notFound('Exam not found');
  ApiResponse.success(res, 'Exam updated', exam);
});

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Instructor
const deleteExam = asyncHandler(async (req, res) => {
  await Exam.findByIdAndDelete(req.params.id);
  await Question.deleteMany({ examId: req.params.id });
  ApiResponse.success(res, 'Exam deleted');
});

// @desc    Add question to exam
// @route   POST /api/exams/:id/questions
// @access  Private/Instructor
const addQuestion = asyncHandler(async (req, res) => {
  const count = await Question.countDocuments({ examId: req.params.id });
  const question = await Question.create({
    ...req.body,
    examId: req.params.id,
    order: req.body.order ?? count,
  });
  // Recalculate exam total marks
  await examService.recalculateTotalMarks(req.params.id);
  ApiResponse.created(res, 'Question added', question);
});

// @desc    Request extra exam attempts
// @route   POST /api/exams/:id/request-attempt
// @access  Private/Student
const requestAttempt = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw ApiError.notFound('Exam not found');

  if (!exam.isPublished) {
    throw ApiError.forbidden('Exam is not published');
  }

  const Enrollment = require('../models/Enrollment');
  const enrollment = await Enrollment.findOne({
    studentId: req.user._id,
    courseId: exam.courseId,
  });
  if (!enrollment) {
    throw ApiError.forbidden('You must be enrolled in this course to request attempts');
  }

  const status = await examService.getAttemptStatus(exam._id, req.user._id);

  if (status.attemptsLeft > 0) {
    throw ApiError.badRequest('You still have attempts remaining for this exam');
  }

  if (status.hasPendingRequest) {
    throw ApiError.badRequest('You already have a pending request for this exam');
  }

  const Course = require('../models/Course');
  const course = await Course.findById(exam.courseId);
  if (!course) throw ApiError.notFound('Associated course not found');

  const ExamAttemptRequest = require('../models/ExamAttemptRequest');
  const request = await ExamAttemptRequest.create({
    examId: exam._id,
    courseId: exam.courseId,
    studentId: req.user._id,
    instructorId: course.creatorId,
    message: req.body.message || '',
    status: 'pending',
    requestedAttempts: 2,
    grantedAttempts: 0,
  });

  // Create notification for instructor
  const { createNotification } = require('../utils/notificationHelper');
  createNotification(
    course.creatorId,
    'exam-schedule',
    'New Exam Attempt Request 🏆',
    `${req.user.name} requested extra attempts for "${exam.title}".`,
    `/dashboard?tab=exam-requests`
  ).catch(console.error);

  ApiResponse.created(res, 'Attempt extension requested successfully', request);
});

// @desc    Get exam attempt requests (Instructor)
// @route   GET /api/exams/instructor/attempt-requests
// @access  Private/Instructor
const getInstructorAttemptRequests = asyncHandler(async (req, res) => {
  const ExamAttemptRequest = require('../models/ExamAttemptRequest');
  const requests = await ExamAttemptRequest.find({ instructorId: req.user._id })
    .populate('studentId', 'name email profileImage')
    .populate('examId', 'title maxAttempts')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, 'Exam attempt requests fetched', requests);
});

// @desc    Approve or reject exam attempt request
// @route   PATCH /api/exams/attempt-requests/:requestId
// @access  Private/Instructor
const updateAttemptRequestStatus = asyncHandler(async (req, res) => {
  const { status, instructorResponse } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw ApiError.badRequest('Status must be approved or rejected');
  }

  const ExamAttemptRequest = require('../models/ExamAttemptRequest');
  const request = await ExamAttemptRequest.findById(req.params.requestId);
  if (!request) throw ApiError.notFound('Request not found');

  // Verify ownership
  const Course = require('../models/Course');
  const course = await Course.findById(request.courseId);
  if (!course) throw ApiError.notFound('Course not found');

  if (course.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to review this request');
  }

  if (request.status !== 'pending') {
    throw ApiError.badRequest('This request has already been reviewed');
  }

  request.status = status;
  request.instructorResponse = instructorResponse || '';
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  request.grantedAttempts = status === 'approved' ? 2 : 0;

  await request.save();

  const Exam = require('../models/Exam');
  const exam = await Exam.findById(request.examId);

  // Notify student
  const { createNotification } = require('../utils/notificationHelper');
  createNotification(
    request.studentId,
    'exam-schedule',
    status === 'approved' ? 'Attempt Request Approved! 🎉' : 'Attempt Request Rejected ❌',
    status === 'approved'
      ? `Your request for extra attempts in "${exam.title}" has been approved. +2 attempts granted.`
      : `Your request for extra attempts in "${exam.title}" has been rejected.`,
    `/dashboard`
  ).catch(console.error);

  ApiResponse.success(res, `Request ${status} successfully`, request);
});

module.exports = {
  createExam, getExams, getExam, takeExam,
  submitExam, getExamResults, updateExam, deleteExam, addQuestion,
  requestAttempt, getInstructorAttemptRequests, updateAttemptRequestStatus,
};
