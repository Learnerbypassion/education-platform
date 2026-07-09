const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const courseService = require('../services/courseService');
const Course = require('../models/Course');

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }
  const course = await courseService.createCourse(req.body, req.user._id);
  ApiResponse.created(res, 'Course created', course);
});

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const { page, limit, category, difficulty, search } = req.query;
  const result = await courseService.getCourses(
    { category, difficulty, search },
    parseInt(page) || 1,
    parseInt(limit) || 12
  );
  ApiResponse.paginated(res, 'Courses fetched', result.courses, result.pagination);
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id, req.user);
  ApiResponse.success(res, 'Course details', course);
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor (owner)
const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  if (course.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to update this course');
  }

  // Handle thumbnail upload
  if (req.file) {
    req.body.thumbnail = `/uploads/${req.file.filename}`;
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, 'Course updated', course);
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor (owner) or Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  if (course.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to delete this course');
  }

  await Course.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'Course deleted');
});

// @desc    Publish / unpublish course
// @route   PATCH /api/courses/:id/publish
// @access  Private/Instructor (owner)
const togglePublish = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  if (course.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  course.isPublished = !course.isPublished;
  await course.save();

  ApiResponse.success(res, `Course ${course.isPublished ? 'published' : 'unpublished'}`, course);
});

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
const enrollCourse = asyncHandler(async (req, res) => {
  const enrollment = await courseService.enrollStudent(req.user._id, req.params.id);
  ApiResponse.created(res, 'Enrollment successful', enrollment);
});

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/me
// @access  Private/Instructor
const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.getInstructorCourses(req.user._id);
  ApiResponse.success(res, 'Instructor courses', courses);
});

// @desc    Get enrolled courses
// @route   GET /api/courses/enrolled/me
// @access  Private/Student
const getEnrolledCourses = asyncHandler(async (req, res) => {
  const enrollments = await courseService.getEnrolledCourses(req.user._id);
  ApiResponse.success(res, 'Enrolled courses', enrollments);
});

module.exports = {
  createCourse, getCourses, getCourseById, updateCourse,
  deleteCourse, togglePublish, enrollCourse, getInstructorCourses, getEnrolledCourses,
};
