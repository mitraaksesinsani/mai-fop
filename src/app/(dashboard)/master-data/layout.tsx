'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function MasterDataLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is loaded and user exists, allow ADMIN or users with appropriate access
    if (!isLoading && user) {
      const userRole = user.role?.toUpperCase();
      if (userRole && userRole !== 'ADMIN' && userRole !== 'MANAGEMENT') {
        router.replace('/');
      }
    }
  }, [user, isLoading, router]);

  // If loading, show loader
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
