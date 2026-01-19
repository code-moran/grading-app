'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'student' | 'instructor' | 'admin' | ('student' | 'instructor' | 'admin')[];
  fallbackUrl?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackUrl = '/auth/signin' 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      router.push(fallbackUrl);
      return;
    }

    if (requiredRole) {
      const userRole = (session.user as any)?.role;
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      
      if (!allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'admin') {
          router.push('/admin');
        } else if (userRole === 'instructor') {
          router.push('/instructor');
        } else {
          router.push('/student');
        }
        return;
      }
    }
  }, [session, status, router, requiredRole, fallbackUrl]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  if (requiredRole) {
    const userRole = (session.user as any)?.role;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(userRole)) {
      return null; // Will redirect
    }
  }

  return <>{children}</>;
}