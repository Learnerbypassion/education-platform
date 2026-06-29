const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Exam duration is required'],
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks are required'],
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    maxAttempts: {
      type: Number,
      default: 1,
    },
    isRandomized: {
      type: Boolean,
      default: true,
    },
    showResults: {
      type: Boolean,
      default: true, // Show results immediately after submission
    },
    instructions: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
examSchema.index({ courseId: 1 });
examSchema.index({ createdBy: 1 });

// Virtual: questions
examSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'examId',
});

module.exports = mongoose.model('Exam', examSchema);
