'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useAppDispatch } from '@/store/hooks';
import { setUser, setAuthInitialized } from '@/store/slices/authSlice';
import { auth } from '@/lib/firebase';
import { User } from '@/types';

// Helper function to convert Firebase user to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || undefined,
  photoURL: firebaseUser.photoURL || undefined,
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        // User is signed in
        const user = convertFirebaseUser(firebaseUser);
        dispatch(setUser(user));

        // Store the token in localStorage
        try {
          const idToken = await firebaseUser.getIdToken();
          localStorage.setItem('authToken', idToken);
        } catch (error) {
          console.error('Error getting ID token:', error);
        }
      } else {
        // User is signed out
        dispatch(setUser(null));
        localStorage.removeItem('authToken');
      }

      // Mark auth as initialized after first check
      dispatch(setAuthInitialized(true));
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
