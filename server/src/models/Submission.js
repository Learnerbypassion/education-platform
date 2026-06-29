const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    type: {
      type: String,
      enum: ['assignment', 'exam'],
      required: true,
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId },
        selectedOption: { type: String },       // For MCQ
        selectedOptions: [{ type: String }],    // For multiple correct
        textAnswer: { type: String },           // For fill-blank / short-answer
        isCorrect: { type: Boolean },
      },
    ],
    files: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    githubUrl: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: String,
      default: '',
    },
    gradedAt: {
      type: Date,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
submissionSchema.index({ studentId: 1, examId: 1 });
submissionSchema.index({ studentId: 1, assignmentId: 1 });
submissionSchema.index({ courseId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
