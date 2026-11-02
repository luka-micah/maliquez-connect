import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

import { useAuth } from '@/store/auth';

export default function AppLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="listings/new" options={{ title: 'New Listing' }} />
      <Stack.Screen name="listings/[id]" options={{ title: 'Listing Details' }} />
    </Stack>
  );
}
