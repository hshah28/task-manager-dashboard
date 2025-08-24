'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthLoadingScreen() {
  return (
    <Box
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      minHeight='100vh'
      gap={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>

      <Typography
        variant='h4'
        component='h1'
        fontWeight='bold'
        textAlign='center'
      >
        Task Manager Dashboard
      </Typography>

      <Typography variant='h6' textAlign='center' sx={{ opacity: 0.9 }}>
        Checking authentication...
      </Typography>

      <Typography variant='body2' textAlign='center' sx={{ opacity: 0.7 }}>
        Please wait while we verify your session
      </Typography>
    </Box>
  );
}
