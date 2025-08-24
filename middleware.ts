import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

//  protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/invoice',
  '/api/invoices',
];

// API routes that require authentication
const protectedApiRoutes = [
  '/api/invoices',
];

// Basic ObjectId validation (24 character hex string)
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const authToken = request.cookies.get('auth-token')?.value;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Handle authentication for protected routes
  if (isProtectedRoute || isProtectedApiRoute) {
    if (!authToken) {
      // No auth token, redirect to login
      if (isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        // For API routes, return 401
        return NextResponse.json(
          { success: false, error: 'Not authenticated' },
          { status: 401 }
        );
      }
    }
    
    // Validate auth token format (basic validation)
    if (!authToken.startsWith('user-')) {
      if (isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid token format' },
          { status: 401 }
        );
      }
    }

    // Extract and validate the ObjectId part
    const userId = authToken.replace('user-', '');
    if (!isValidObjectId(userId)) {
      // Invalid ObjectId, clear the cookie and redirect to login
      if (isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.set('auth-token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/'
        });
        return response;
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid authentication token' },
          { status: 401 }
        );
      }
    }
  }

  // Handle authenticated users trying to access login page
  if (pathname === '/login' && authToken) {
    // Validate the token before redirecting
    if (authToken.startsWith('user-')) {
      const userId = authToken.replace('user-', '');
      if (isValidObjectId(userId)) {
        // User is already authenticated with valid token, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        // Invalid token, clear it and stay on login page
        const response = NextResponse.next();
        response.cookies.set('auth-token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/'
        });
        return response;
      }
    }
  }

  // Handle root path redirects
  if (pathname === '/') {
    if (authToken && authToken.startsWith('user-')) {
      const userId = authToken.replace('user-', '');
      if (isValidObjectId(userId)) {
        // Authenticated user with valid token, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        // Invalid token, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.set('auth-token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/'
        });
        return response;
      }
    } else {
      // Unauthenticated user, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Continue with the request if no redirects needed
  return NextResponse.next();
}

//routes middleware should run on
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with below
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
