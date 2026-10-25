import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    memberId: {
      type: String,
      required: [true, 'Please provide a member ID'],
      unique: true,
      trim: true
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
      trim: true
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'user'
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    },
    joinDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    },
    preferredGenres: {
      type: [String],
      default: ['Computer Science', 'Artificial Intelligence']
    },
    readingGoal: {
      target: { type: Number, default: 20, min: 1 },
      completed: { type: Number, default: 0, min: 0 }
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual id property
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Hash password prior to saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
