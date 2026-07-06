const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Review = require('../models/Review');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');

// @desc    Get reviews for a course
// @route   GET /api/courses/:courseId/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ courseId: req.params.courseId }).populate({
    path: 'userId',
    select: 'name profileImage'
  });
  ApiResponse.success(res, 'Reviews fetched successfully', reviews);
});

// @desc    Add a review
// @route   POST /api/courses/:courseId/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  req.body.courseId = req.params.courseId;
  req.body.userId = req.user.id;

  const course = await Course.findById(req.params.courseId);
  if (!course) {
    throw ApiError.notFound(`Course not found with id of ${req.params.courseId}`);
  }

  // Check if user already submitted a review
  const existingReview = await Review.findOne({ courseId: req.params.courseId, userId: req.user.id });
  if (existingReview) {
    throw ApiError.badRequest('You have already submitted a review for this course');
  }

  const review = await Review.create(req.body);
  ApiResponse.created(res, 'Review added successfully', review);
});

module.exports = { getReviews, addReview };
