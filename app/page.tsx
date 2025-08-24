import { redirect } from 'next/navigation';
import { getAuthUserFromHeaders } from '@/lib/server-utils';

// Force dynamic rendering because we use headers() for authentication
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Check if user is authenticated
  const user = await getAuthUserFromHeaders();
  
  if (user) {
    // Redirect authenticated users to dashboard
    redirect('/dashboard');
  } else {
    // Redirect unauthenticated users to login
    redirect('/login');
  }
}
