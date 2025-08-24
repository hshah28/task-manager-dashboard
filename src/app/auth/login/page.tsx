'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';
import AuthLoadingScreen from '@/components/AuthLoadingScreen';
import ToastNotification from '@/components/ToastNotification';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
} from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, error, initialized } = useAppSelector(
    state => state.auth
  );

  // Toast notification state
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (initialized && user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, initialized, router]);

  // Show toast when error changes
  useEffect(() => {
    if (error) {
      setToast({
        open: true,
        message: error,
        type: 'error',
      });
    }
  }, [error]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      // Clear any existing errors when leaving the page
      dispatch({ type: 'auth/clearError' });
    };
  }, [dispatch]);

  // Toast handlers
  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
    // Also clear the error from the store when toast is closed
    dispatch({ type: 'auth/clearError' });
  };

  // Show loading state while checking authentication
  if (!initialized || loading) {
    return <AuthLoadingScreen />;
  }

  // Don't render login form if user is authenticated
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      router.push('/dashboard');
    } catch {
      // Error is handled by the slice
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 3,
          textAlign: 'center',
        }}
      >
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            component='h1'
            fontWeight='bold'
            gutterBottom
          >
            Task Manager Dashboard
          </Typography>
          <Typography variant='h6' sx={{ opacity: 0.9 }}>
            Organize, track, and complete your projects efficiently
          </Typography>
        </Container>
      </Box>

      {/* Main Content - Split Layout */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Grid container spacing={6} alignItems='center'>
            {/* Left Side - Hero Image */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: 4,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 300,
                    bgcolor: 'grey.100',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  {/* Placeholder for hero image - you can replace this with an actual image */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: 'white',
                    }}
                  >
                    <Typography variant='h2' sx={{ mb: 2 }}>
                      📋
                    </Typography>
                    <Typography variant='h5' fontWeight='bold'>
                      Welcome Back!
                    </Typography>
                    <Typography variant='body1' sx={{ mt: 1, opacity: 0.9 }}>
                      Sign in to continue managing your tasks
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant='h5'
                  color='primary'
                  fontWeight='bold'
                  gutterBottom
                >
                  Streamline Your Workflow
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ maxWidth: 400 }}
                >
                  Manage projects, track progress, and collaborate with your
                  team all in one place. Stay organized and boost your
                  productivity.
                </Typography>
              </Box>
            </Grid>

            {/* Right Side - Login Form */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant='h4'
                    component='h2'
                    fontWeight='bold'
                    gutterBottom
                  >
                    Sign In
                  </Typography>
                  <Typography variant='body1' color='text.secondary'>
                    Access your account to continue
                  </Typography>
                </Box>

                {/* Error messages are now shown as toast notifications */}

                <Box component='form' onSubmit={handleSubmit}>
                  <TextField
                    margin='normal'
                    required
                    fullWidth
                    id='email'
                    label='Email Address'
                    name='email'
                    autoComplete='email'
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    sx={{ mb: 2 }}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                  <TextField
                    margin='normal'
                    required
                    fullWidth
                    name='password'
                    label='Password'
                    type='password'
                    id='password'
                    autoComplete='current-password'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    sx={{ mb: 3 }}
                    InputProps={{
                      sx: { borderRadius: 2 },
                    }}
                  />
                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    size='large'
                    sx={{
                      py: 1.5,
                      mb: 3,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>

                  <Box textAlign='center'>
                    <Typography variant='body2' color='text.secondary'>
                      Don&apos;t have an account?{' '}
                      <Link
                        href='/auth/register'
                        onClick={() => dispatch({ type: 'auth/clearError' })}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          fontWeight: 'bold',
                        }}
                      >
                        Sign up here
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Toast Notification */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </Box>
  );
}
