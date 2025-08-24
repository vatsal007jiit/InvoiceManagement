import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { getUserById } from '@/controllers/userController';
import mongoose from 'mongoose';

export function getAuthUser(request: NextRequest): { id: string; email: string; role: string; name: string } | null {
  const authToken = request.cookies.get('auth-token')?.value;

  if (!authToken || !authToken.startsWith('user-')) {
    return null;
  }

  const userId = authToken.replace('user-', '');
  
  // Check if the userId is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null; // Invalid ObjectId, treat as not authenticated
  }
  
  return {
    id: userId,
    email: '',
    role: '',
    name: ''
  };
}

export function getAuthUserFromCookies(request: NextRequest): { id: string; email: string; role: string; name: string } | null {
  return getAuthUser(request);
}

export async function getAuthUserFromHeaders(): Promise<{ id: string; email: string; role: string; name: string } | null> {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const authToken = cookies['auth-token'];

    if (!authToken || !authToken.startsWith('user-')) {
      return null;
    }

    const userId = authToken.replace('user-', '');
   
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null; // Invalid ObjectId, treat as not authenticated
    }
    
    // Fetch actual user data from database
    const user = await getUserById(userId);
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

  } catch (error) {
    console.error('Error getting auth user from headers:', error);
    return null;
  }
}
