const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const aiService = require('../services/aiService');

// @desc    Generate course description
// @route   POST /api/ai/course-description
// @access  Private/Instructor
const generateCourseDescription = asyncHandler(async (req, res) => {
  const { title, category } = req.body;
  if (!title || !category) {
    throw new ApiError(400, 'Title and category are required to generate description');
  }

  const description = await aiService.generateDescription(title, category);
  ApiResponse.success(res, 'Course description generated successfully', { description });
});

// @desc    Generate lesson summary
// @route   POST /api/ai/lesson-summary
// @access  Private/Instructor
const generateLessonSummary = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    throw new ApiError(400, 'Lesson title is required to generate summary');
  }

  const summary = await aiService.generateSummary(title, content || '');
  ApiResponse.success(res, 'Lesson summary generated successfully', { summary });
});

// @desc    Generate custom prompt
// @route   POST /api/ai/custom
// @access  Private/Instructor
const generateCustomPrompt = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    throw new ApiError(400, 'Prompt is required');
  }

  const text = await aiService.generateCustom(prompt);
  ApiResponse.success(res, 'AI response generated successfully', { text });
});

module.exports = {
  generateCourseDescription,
  generateLessonSummary,
  generateCustomPrompt,
};
