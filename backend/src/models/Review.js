import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    bookId: {
      type: String,
      required: [true, 'Book ID is required'],
      index: true
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    userRole: {
      type: String,
      default: 'Student Scholar'
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars']
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual id property for frontend compatibility
reviewSchema.virtual('id').get(function () {
  return this.customId || this._id.toHexString();
});

// Helper static method to recompute average rating on Book
reviewSchema.statics.recalculateBookRating = async function (bookObjectId) {
  const stats = await this.aggregate([
    { $match: { book: bookObjectId } },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  const Book = mongoose.model('Book');
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookObjectId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      ratingCount: stats[0].ratingCount
    });
  } else {
    await Book.findByIdAndUpdate(bookObjectId, {
      rating: 5.0,
      ratingCount: 0
    });
  }
};

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
