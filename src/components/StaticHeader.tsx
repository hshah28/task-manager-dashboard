'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import WelcomeMessage from './WelcomeMessage';

export default function StaticHeader() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logoutUser()).unwrap();
      // Don't need to manually redirect - useEffect will handle it
    } catch {
      console.error('Logout failed');
      setIsLoggingOut(false);
    }
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  if (!user) return null;

  return (
    <AppBar
      position='static'
      elevation={0}
      sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}
    >
      <Toolbar sx={{ px: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color='inherit'
              onClick={handleDashboardClick}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <DashboardIcon />
            </IconButton>
            <Typography variant='h6' component='div' fontWeight='bold'>
              Task Manager Dashboard
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WelcomeMessage user={user} />

          <IconButton
            color='inherit'
            onClick={handleLogout}
            disabled={isLoggingOut}
            sx={{
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            {isLoggingOut ? (
              <CircularProgress size={20} color='inherit' />
            ) : (
              <LogoutIcon />
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
