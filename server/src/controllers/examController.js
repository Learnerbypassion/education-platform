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
  ApiResponse.success(res, 'Exams fetched', exams);
});

// @desc    Get exam by ID (for instructor — includes answers)
// @route   GET /api/exams/:id
// @access  Private/Instructor
const getExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) throw ApiError.notFound('Exam not found');
  const questions = await Question.find({ examId: exam._id }).sort({ order: 1 });
  ApiResponse.success(res, 'Exam details', { ...exam.toObject(), questions });
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

module.exports = {
  createExam, getExams, getExam, takeExam,
  submitExam, getExamResults, updateExam, deleteExam, addQuestion,
};
