const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['mcq', 'file-submission', 'coding', 'github-project'],
      required: true,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String }], // For MCQ
        correctAnswer: { type: String },
        marks: { type: Number, default: 1 },
      },
    ],
    totalMarks: {
      type: Number,
      default: 100,
    },
    passingMarks: {
      type: Number,
      default: 40,
    },
    dueDate: {
      type: Date,
    },
    maxAttempts: {
      type: Number,
      default: 1,
    },
    instructions: {
      type: String,
      default: '',
    },
    attachments: [
      {
        name: String,
        url: String,
        type: { type: String },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ moduleId: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
