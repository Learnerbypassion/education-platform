const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    percentComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    watchTime: {
      type: Number, // in seconds
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    lastPosition: {
      type: Number, // video timestamp in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique progress per student per lesson
progressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ studentId: 1, courseId: 1 });

module.exports = mongoose.model('Progress', progressSchema);
