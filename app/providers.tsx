'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useVisitorTracking } from '@/lib/hooks/useVisitorTracking';

function VisitorTracker() {
  useVisitorTracking();
  return null;
}

function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { setFirebaseUser, setLoading } = useAuthStore();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Dynamically import Firebase to avoid SSR issues
    import('@/lib/firebase').then(({ auth }) => {
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        unsubscribe = onAuthStateChanged(auth, (user) => {
          setFirebaseUser(user);
          setLoading(false);
        });
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setFirebaseUser, setLoading]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAuthProvider>
        <VisitorTracker />
        {children}
      </FirebaseAuthProvider>
    </QueryClientProvider>
  );
}
