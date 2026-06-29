const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Course = require('../models/Course');

// @desc    Search courses with filters
// @route   GET /api/search/courses
// @access  Public
const searchCourses = asyncHandler(async (req, res) => {
  const { q, category, difficulty, language, sort, page = 1, limit = 12 } = req.query;

  const query = { isPublished: true };

  // Text search
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ];
  }

  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (language) query.language = language;

  // Sort options
  let sortOption = { createdAt: -1 };
  if (sort === 'popular') sortOption = { enrollmentCount: -1 };
  if (sort === 'rating') sortOption = { 'rating.average': -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('creatorId', 'name profileImage')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  ApiResponse.paginated(res, 'Search results', courses, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

module.exports = { searchCourses };
