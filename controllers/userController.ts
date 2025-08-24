import User, { IUser } from '@/models/User';
import dbConnect from '@/lib/db';
import bcrypt from 'bcryptjs';

export const getUserByEmail = async (email: string): Promise<any | null> => {
  await dbConnect();
  return await User.findOne({ email }).select('-password');
};

export const getUserById = async (id: string): Promise<any | null> => {
  await dbConnect();
  return await User.findById(id).select('-password');
};

export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'accountant';
}): Promise<any> => {
  await dbConnect();
  const user = new User(userData);
  return await user.save();
};

export const authenticateUser = async (email: string, password: string): Promise<any | null> => {
  await dbConnect();
  const user = await User.findOne({ email });
  
  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  return user;
};
