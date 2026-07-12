const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    completionDate: {
      type: Date,
      default: Date.now,
    },
    qrCode: {
      type: String, // Data URL of QR code
      default: '',
    },
    pdfUrl: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['completion', 'skill-verification', 'achievement'],
      default: 'completion',
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    grade: {
      type: String, // A, B, C, etc.
      default: '',
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ certificateId: 1 }, { unique: true });
certificateSchema.index({ studentId: 1 });
certificateSchema.index({ courseId: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
