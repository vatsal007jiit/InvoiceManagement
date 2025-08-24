import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'accountant';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'accountant'],
      default: 'accountant',
    },
  },
  {
    timestamps: true,
  }
);

// No duplicate indexes needed - Mongoose handles this automatically

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with salt rounds of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
