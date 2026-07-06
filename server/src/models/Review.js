const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per course
reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

// Static method to get average rating and save
reviewSchema.statics.getAverageRating = async function (courseId) {
  const obj = await this.aggregate([
    {
      $match: { courseId }
    },
    {
      $group: {
        _id: '$courseId',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    const Course = mongoose.model('Course');
    if (obj.length > 0) {
      await Course.findByIdAndUpdate(courseId, {
        'rating.average': obj[0].averageRating.toFixed(1),
        'rating.count': obj[0].count
      });
    } else {
      await Course.findByIdAndUpdate(courseId, {
        'rating.average': 0,
        'rating.count': 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.courseId);
});

// Call getAverageRating before remove
reviewSchema.post('remove', function () {
  this.constructor.getAverageRating(this.courseId);
});

module.exports = mongoose.model('Review', reviewSchema);
