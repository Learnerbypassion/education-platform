const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    type: {
      type: String,
      enum: ['mcq', 'multiple-correct', 'true-false', 'fill-in-the-blank', 'short-answer'],
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: [
      {
        text: { type: String },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    correctAnswer: {
      type: String, // For fill-in-the-blank and true-false
      default: '',
    },
    explanation: {
      type: String,
      default: '', // Explanation shown after answering
    },
    marks: {
      type: Number,
      default: 1,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
questionSchema.index({ examId: 1 });
questionSchema.index({ assignmentId: 1 });

module.exports = mongoose.model('Question', questionSchema);
