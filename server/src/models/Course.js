const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'web-development',
        'mobile-development',
        'data-science',
        'machine-learning',
        'devops',
        'cybersecurity',
        'cloud-computing',
        'programming-languages',
        'database',
        'software-engineering',
        'ui-ux-design',
        'digital-marketing',
        'business',
        'other',
      ],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    structureType: {
      type: String,
      enum: ['week-based', 'day-based', 'topic-based'],
      required: [true, 'Structure type is required'],
      default: 'topic-based',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    language: {
      type: String,
      default: 'English',
    },
    tags: [{ type: String, trim: true }],
    prerequisites: [{ type: String }],
    learningOutcomes: [{ type: String }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    price: {
      type: Number,
      default: 0, // 0 = free
    },
    estimatedDuration: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ creatorId: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ createdAt: -1 });

// Virtual: modules
courseSchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'courseId',
});

module.exports = mongoose.model('Course', courseSchema);
