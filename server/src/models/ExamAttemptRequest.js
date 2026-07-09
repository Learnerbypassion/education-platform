const mongoose = require('mongoose');

const examAttemptRequestSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      default: '',
    },
    instructorResponse: {
      type: String,
      default: '',
    },
    requestedAttempts: {
      type: Number,
      default: 2,
    },
    grantedAttempts: {
      type: Number,
      default: 0,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance and partial unique index to avoid duplicate pending requests
examAttemptRequestSchema.index({ examId: 1, studentId: 1, status: 1 });
examAttemptRequestSchema.index({ instructorId: 1, status: 1 });
examAttemptRequestSchema.index(
  { examId: 1, studentId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  }
);

module.exports = mongoose.model('ExamAttemptRequest', examAttemptRequestSchema);
