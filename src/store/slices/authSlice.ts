import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

// Helper function to convert Firebase user to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || undefined,
  photoURL: firebaseUser.photoURL || undefined,
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get the ID token and store it
      const idToken = await firebaseUser.getIdToken();
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', idToken);
      }

      return {
        user: convertFirebaseUser(firebaseUser),
        token: idToken,
      };
    } catch (error: any) {
      // Map Firebase error codes to user-friendly messages
      if (error.code === 'auth/invalid-credential') {
        throw new Error(
          'User does not exist. Please check your email or create a new account.'
        );
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        throw new Error(
          'User does not exist. Please check your email or create a new account.'
        );
      } else if (error.code === 'auth/invalid-email') {
        throw new Error(
          'Invalid email format. Please enter a valid email address.'
        );
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error(
          'Too many login attempts. Please wait a few minutes before trying again.'
        );
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error(
          'Connection error. Please check your internet connection and try again.'
        );
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Get the ID token and store it
      const idToken = await firebaseUser.getIdToken();
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', idToken);
      }

      return {
        user: convertFirebaseUser(firebaseUser),
        token: idToken,
      };
    } catch (error: any) {
      // Map Firebase error codes to user-friendly messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error(
          'An account with this email already exists. Please try logging in instead.'
        );
      } else if (error.code === 'auth/invalid-email') {
        throw new Error(
          'Invalid email format. Please enter a valid email address.'
        );
      } else if (error.code === 'auth/weak-password') {
        throw new Error(
          'Password is too weak. Please choose a stronger password.'
        );
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error(
          'Connection error. Please check your internet connection and try again.'
        );
      } else {
        throw new Error(
          error.message || 'Registration failed. Please try again.'
        );
      }
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await signOut(auth);
    // Remove the stored token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Logout failed');
  }
});

// Check for existing authentication token and restore user session
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        return null;
      }

      // Verify the token with Firebase
      const user = auth.currentUser;
      if (user) {
        // User is already signed in
        const idToken = await user.getIdToken();
        if (idToken === token) {
          return convertFirebaseUser(user);
        }
      }

      return null;
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setAuthInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Logout
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.error = null;
      })
      // Check Auth Status
      .addCase(checkAuthStatus.pending, state => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(checkAuthStatus.rejected, state => {
        state.loading = false;
        state.user = null;
      });
  },
});

export const { setUser, setAuthInitialized, clearError } = authSlice.actions;
export default authSlice.reducer;
