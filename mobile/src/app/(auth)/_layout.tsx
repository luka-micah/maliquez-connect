import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

import { useAuth } from '@/store/auth';

export default function AuthLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
