'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { User } from '@/types';

interface WelcomeMessageProps {
  user: User;
}

export default function WelcomeMessage({ user }: WelcomeMessageProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 0.5,
        bgcolor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.15)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(102, 126, 234,0.3)',
        }}
      >
        <Typography variant='body2' sx={{ color: 'white', fontWeight: 'bold' }}>
          {user.displayName
            ? user.displayName.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase()}
        </Typography>
      </Box>
      <Box>
        <Typography
          variant='body2'
          sx={{ color: 'white', fontWeight: 'medium', lineHeight: 1.2 }}
        >
          Welcome back,
        </Typography>
        <Typography
          variant='body1'
          sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.2 }}
        >
          {user.displayName || user.email.split('@')[0]}
        </Typography>
      </Box>
    </Box>
  );
}
