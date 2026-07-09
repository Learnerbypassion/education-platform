const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Create module
// @route   POST /api/modules/:courseId
// @access  Private/Instructor
const createModule = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw ApiError.notFound('Course not found');
  if (course.creatorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  const count = await Module.countDocuments({ courseId: req.params.courseId });
  const module = await Module.create({
    ...req.body,
    courseId: req.params.courseId,
    order: req.body.order ?? count,
  });

  ApiResponse.created(res, 'Module created', module);
});

// @desc    Get modules for a course
// @route   GET /api/modules/:courseId
// @access  Public
const getModules = asyncHandler(async (req, res) => {
  const modules = await Module.find({ courseId: req.params.courseId }).sort({ order: 1 });
  ApiResponse.success(res, 'Modules fetched', modules);
});

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private/Instructor
const updateModule = asyncHandler(async (req, res) => {
  const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!module) throw ApiError.notFound('Module not found');
  ApiResponse.success(res, 'Module updated', module);
});

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private/Instructor
const deleteModule = asyncHandler(async (req, res) => {
  const module = await Module.findByIdAndDelete(req.params.id);
  if (!module) throw ApiError.notFound('Module not found');
  ApiResponse.success(res, 'Module deleted');
});

module.exports = { createModule, getModules, updateModule, deleteModule };
