'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

import AuthLoadingScreen from '@/components/AuthLoadingScreen';

export default function Home() {
  const router = useRouter();
  const { user, loading, initialized } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (initialized && !loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, initialized, router]);

  // Show loading screen while auth is being determined
  if (!initialized || loading) {
    return <AuthLoadingScreen />;
  }

  return null;
}
