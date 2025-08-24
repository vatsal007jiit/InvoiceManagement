import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-utils';
import { getUserById } from '@/controllers/userController';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No valid authentication token'
      }, { status: 200 });
    }

    // Check if the userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(user.id)) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'Invalid authentication token'
      }, { status: 200 });
    }

    // Get fresh user data from database using the actual user ID
    const freshUser = await getUserById(user.id);
    if (!freshUser) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'User not found'
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: freshUser._id.toString(),
        email: freshUser.email,
        role: freshUser.role,
        name: freshUser.name
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
