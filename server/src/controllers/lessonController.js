const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const { parseVideoUrl } = require('../utils/videoParser');
const sanitizeLessonContent = require('../utils/sanitizeLessonContent');

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

  if (lessonData.content) {
    lessonData.content = sanitizeLessonContent(lessonData.content);
  }

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
// @access  Private (Enrolled students/Owner/Admin)
const getLessons = asyncHandler(async (req, res) => {
  const Module = require('../models/Module');
  const Course = require('../models/Course');
  const Enrollment = require('../models/Enrollment');

  const mod = await Module.findById(req.params.moduleId);
  if (!mod) throw ApiError.notFound('Module not found');

  const course = await Course.findById(mod.courseId);
  if (!course) throw ApiError.notFound('Associated course not found');

  // Verify access: Owner, Admin, or Enrolled Student
  let hasAccess = false;
  if (req.user.role === 'admin' || course.creatorId.toString() === req.user._id.toString()) {
    hasAccess = true;
  } else {
    const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId: course._id });
    if (enrollment) {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    // Only return free/preview lessons if not authorized
    const lessons = await Lesson.find({ moduleId: req.params.moduleId, isFree: true }).sort({ order: 1 });
    return ApiResponse.success(res, 'Preview lessons fetched', lessons);
  }

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

  if (req.body.content !== undefined) {
    req.body.content = sanitizeLessonContent(req.body.content);
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

// @desc    Start a lesson progress
// @route   POST /api/lessons/:id/start
// @access  Private/Student
const startLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw ApiError.notFound('Lesson not found');

  const enrollment = await Enrollment.findOne({
    studentId: req.user._id,
    courseId: lesson.courseId,
  });
  if (!enrollment) {
    throw ApiError.forbidden('You must be enrolled in this course');
  }

  const progress = await Progress.findOneAndUpdate(
    {
      studentId: req.user._id,
      lessonId: lesson._id,
    },
    {
      $setOnInsert: {
        studentId: req.user._id,
        lessonId: lesson._id,
        courseId: lesson.courseId,
        startedAt: new Date(),
        percentComplete: 0,
      },
      $set: {
        lastActivityAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  ApiResponse.success(res, 'Lesson started', progress);
});

// @desc    Mark lesson as complete / update progress
// @route   POST /api/lessons/:id/progress
// @access  Private/Student
const updateProgress = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw ApiError.notFound('Lesson not found');

  const enrollment = await Enrollment.findOne({
    studentId: req.user._id,
    courseId: lesson.courseId,
  });
  if (!enrollment) {
    throw ApiError.forbidden('You must be enrolled in this course');
  }

  let progress = await Progress.findOne({ studentId: req.user._id, lessonId: req.params.id });
  if (!progress || !progress.startedAt) {
    throw ApiError.badRequest('You must start the lesson first');
  }

  if (progress.percentComplete === 100 && progress.completedAt) {
    return ApiResponse.success(res, 'Progress updated', progress);
  }

  const getMinimumRequiredSeconds = (lessonDoc) => {
    const duration = Number(lessonDoc.durationSeconds || lessonDoc.duration * 60); // duration might be in minutes
    if (!Number.isFinite(duration) || duration <= 0) {
      return 60;
    }
    return Math.max(15, Math.min(Math.ceil(duration * 0.7), 1800));
  };

  const elapsedSeconds = (Date.now() - progress.startedAt.getTime()) / 1000;
  const minimumRequiredSeconds = getMinimumRequiredSeconds(lesson);

  if (elapsedSeconds < minimumRequiredSeconds) {
    throw ApiError.badRequest('This lesson cannot be completed yet. Minimum reading/watch time not met.');
  }

  progress.percentComplete = 100;
  progress.isCompleted = true;
  progress.completedAt = new Date();
  progress.lastActivityAt = new Date();
  await progress.save();

  // Update enrollment completed lessons
  const alreadyCompleted = enrollment.completedLessons?.some(
    (id) => id.toString() === lesson._id.toString()
  );

  if (!alreadyCompleted) {
    enrollment.completedLessons = [...(enrollment.completedLessons || []), lesson._id];
  }
  enrollment.lastAccessedAt = new Date();

  const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId, isFree: { $ne: true } }); // Count required lessons? wait, previously we counted all.
  const actualTotalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
  const completedCount = enrollment.completedLessons.length;
  const progressPercent = actualTotalLessons > 0 ? Math.round((completedCount / actualTotalLessons) * 100) : 0;
  
  enrollment.progress = progressPercent;
  if (progressPercent === 100) {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
  }
  await enrollment.save();

  ApiResponse.success(res, 'Progress updated', progress);
});

module.exports = { createLesson, getLessons, updateLesson, deleteLesson, startLesson, updateProgress };
