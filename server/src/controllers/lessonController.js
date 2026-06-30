const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const { parseVideoUrl } = require('../utils/videoParser');

// @desc    Create lesson
// @route   POST /api/lessons/:moduleId
// @access  Private/Instructor
const createLesson = asyncHandler(async (req, res) => {
  const count = await Lesson.countDocuments({ moduleId: req.params.moduleId });

  const lessonData = {
    ...req.body,
    moduleId: req.params.moduleId,
    courseId: req.body.courseId,
    order: req.body.order ?? count,
  };

  // Parse video URL
  if (lessonData.videoUrl) {
    const parsed = parseVideoUrl(lessonData.videoUrl);
    if (parsed) {
      lessonData.videoPlatform = parsed.platform;
      lessonData.videoEmbedUrl = parsed.embedUrl;
    }
  }

  // Handle file attachments
  if (req.files && req.files.length > 0) {
    lessonData.attachments = req.files.map((f) => ({
      name: f.originalname,
      url: `/uploads/${f.filename}`,
      type: f.mimetype,
      size: f.size,
    }));
  }

  const lesson = await Lesson.create(lessonData);
  ApiResponse.created(res, 'Lesson created', lesson);
});

// @desc    Get lessons for a module
// @route   GET /api/lessons/:moduleId
// @access  Public
const getLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
  ApiResponse.success(res, 'Lessons fetched', lessons);
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private/Instructor
const updateLesson = asyncHandler(async (req, res) => {
  if (req.body.videoUrl) {
    const parsed = parseVideoUrl(req.body.videoUrl);
    if (parsed) {
      req.body.videoPlatform = parsed.platform;
      req.body.videoEmbedUrl = parsed.embedUrl;
    }
  }

  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!lesson) throw ApiError.notFound('Lesson not found');
  ApiResponse.success(res, 'Lesson updated', lesson);
});

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Instructor
const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) throw ApiError.notFound('Lesson not found');
  ApiResponse.success(res, 'Lesson deleted');
});

// @desc    Mark lesson as complete / update progress
// @route   POST /api/lessons/:id/progress
// @access  Private/Student
const updateProgress = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw ApiError.notFound('Lesson not found');

  const { percentComplete, watchTime } = req.body;
  const isCompleted = percentComplete >= 90;

  const progress = await Progress.findOneAndUpdate(
    { studentId: req.user._id, lessonId: req.params.id },
    {
      studentId: req.user._id,
      lessonId: req.params.id,
      courseId: lesson.courseId,
      percentComplete: percentComplete || 0,
      watchTime: watchTime || 0,
      isCompleted,
      ...(isCompleted ? { completedAt: new Date() } : {}),
    },
    { upsert: true, new: true }
  );

  // Update enrollment completed lessons and recalculate progress percentage
  if (isCompleted) {
    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId: req.user._id, courseId: lesson.courseId },
      { $addToSet: { completedLessons: lesson._id }, lastAccessedAt: new Date() },
      { new: true }
    );

    if (enrollment) {
      const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
      const completedCount = enrollment.completedLessons.length;
      const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      enrollment.progress = progressPercent;
      if (progressPercent === 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }
      await enrollment.save();
    }
  }

  ApiResponse.success(res, 'Progress updated', progress);
});

module.exports = { createLesson, getLessons, updateLesson, deleteLesson, updateProgress };
