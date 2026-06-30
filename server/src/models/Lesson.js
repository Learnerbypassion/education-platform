const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['video', 'document', 'resource', 'quiz', 'lecture', 'dpp', 'notes', 'dpp-pdf', 'dpp-video'],
      required: true,
    },
    content: {
      type: String,
      default: '', // Rich text or markdown content
    },
    videoUrl: {
      type: String,
      default: '',
    },
    videoPlatform: {
      type: String,
      enum: ['youtube', 'vimeo', 'self-hosted', ''],
      default: '',
    },
    videoEmbedUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String, // pdf, docx, ppt, zip
        size: Number,
      },
    ],
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false, // Preview lessons
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
lessonSchema.index({ moduleId: 1, order: 1 });
lessonSchema.index({ courseId: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
