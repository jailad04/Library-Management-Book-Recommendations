import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters']
    },
    author: {
      type: String,
      required: [true, 'Please provide an author name'],
      trim: true
    },
    isbn: {
      type: String,
      required: [true, 'Please provide an ISBN number'],
      unique: true,
      trim: true
    },
    genre: {
      type: String,
      required: [true, 'Please provide a genre'],
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    publishedYear: {
      type: Number,
      default: () => new Date().getFullYear(),
      min: [1000, 'Invalid publication year']
    },
    publisher: {
      type: String,
      default: 'Academic Press',
      trim: true
    },
    pages: {
      type: Number,
      default: 350,
      min: [1, 'Book must have at least 1 page']
    },
    coverUrl: {
      type: String,
      required: [true, 'Cover URL is required']
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5']
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    },
    totalCopies: {
      type: Number,
      required: [true, 'Please specify total copies in inventory'],
      min: [1, 'Total copies must be at least 1'],
      default: 5
    },
    availableCopies: {
      type: Number,
      required: [true, 'Please specify available copies'],
      min: [0, 'Available copies cannot be negative'],
      default: 5,
      validate: {
        validator: function (val) {
          return val <= this.totalCopies;
        },
        message: 'Available copies ({VALUE}) cannot exceed total copies'
      }
    },
    shelfLocation: {
      type: String,
      default: 'Floor 1 — Shelf A-01',
      trim: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    },
    description: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual id property for frontend compatibility
bookSchema.virtual('id').get(function () {
  return this.customId || this._id.toHexString();
});

// Indexes for fast searching and filtering
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1 });

export const Book = mongoose.model('Book', bookSchema);
export default Book;
