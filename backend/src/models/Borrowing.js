import mongoose from 'mongoose';

const borrowingSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
      index: true
    },
    bookId: {
      type: String,
      required: [true, 'Book ID string is required']
    },
    bookTitle: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true
    },
    bookAuthor: {
      type: String,
      required: [true, 'Book author is required'],
      trim: true
    },
    bookCover: {
      type: String
    },
    borrowDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    dueDate: {
      type: String,
      required: [true, 'Due date is required']
    },
    returnDate: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'due-soon', 'returned', 'overdue'],
        message: '{VALUE} is not a valid borrowing status'
      },
      default: 'active',
      index: true
    },
    renewalsLeft: {
      type: Number,
      default: 2,
      min: [0, 'Renewals cannot be negative']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual id property for frontend compatibility
borrowingSchema.virtual('id').get(function () {
  return this.customId || this._id.toHexString();
});

export const Borrowing = mongoose.model('Borrowing', borrowingSchema);
export default Borrowing;
