const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const analyticsService = require('../services/analyticsService');

// @desc    Get student dashboard stats
// @route   GET /api/analytics/student
// @access  Private/Student
const getStudentStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getStudentStats(req.user._id);
  ApiResponse.success(res, 'Student stats', stats);
});

// @desc    Get instructor dashboard stats
// @route   GET /api/analytics/instructor
// @access  Private/Instructor
const getInstructorStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getInstructorStats(req.user._id);
  ApiResponse.success(res, 'Instructor stats', stats);
});

// @desc    Get admin dashboard stats
// @route   GET /api/analytics/admin
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getAdminStats();
  ApiResponse.success(res, 'Admin stats', stats);
});

module.exports = { getStudentStats, getInstructorStats, getAdminStats };
