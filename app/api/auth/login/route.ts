import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/controllers/userController';
import { sanitizeHtml } from '@/lib/utils';

// Rate limiting store
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Sanitize inputs
    const sanitizedEmail = sanitizeHtml(email?.trim() || '');
    const sanitizedPassword = sanitizeHtml(password?.trim() || '');

    // Basic validation
    if (!sanitizedEmail || !sanitizedPassword) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const attemptData = loginAttempts.get(clientIP);

    if (attemptData && now - attemptData.lastAttempt < 60000) { // 1 minute window
      if (attemptData.count >= 5) { // Max 5 attempts per minute
        return NextResponse.json(
          { success: false, error: 'Too many login attempts. Please try again later.' },
          { status: 429 }
        );
      }
      attemptData.count++;
      attemptData.lastAttempt = now;
    } else {
      loginAttempts.set(clientIP, { count: 1, lastAttempt: now });
    }

    // Authenticate user
    const user = await authenticateUser(sanitizedEmail, sanitizedPassword);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Set authentication cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Set HTTP-only cookie for authentication
    response.cookies.set('auth-token', `user-${user._id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
