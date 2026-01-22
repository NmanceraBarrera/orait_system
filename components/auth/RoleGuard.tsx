'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/login',
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (!allowedRoles.includes(user.rol)) {
        // Redirigir al dashboard correspondiente al rol del usuario
        if (user.rol === 'Rescatista') {
          router.push('/dashboard/rescatista');
        } else if (user.rol === 'Supervisor') {
          router.push('/dashboard/supervisor');
        } else {
          router.push(redirectTo);
        }
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.rol)) {
    return null;
  }

  return <>{children}</>;
}
