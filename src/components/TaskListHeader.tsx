'use client';

import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface TaskListHeaderProps {
  totalTasks: number;
  completedTasks: number;
  onCreateTask: () => void;
  isLoading: boolean;
}

export default function TaskListHeader({
  totalTasks,
  completedTasks,
  onCreateTask,
  isLoading,
}: TaskListHeaderProps) {
  return (
    <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background:
            'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      {/* Main title with gradient text */}
      <Typography
        variant='h3'
        component='h1'
        gutterBottom
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          position: 'relative',
          zIndex: 1,
          mb: 2,
          textShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        }}
      >
        Project Tasks
      </Typography>

      {/* Subtitle with enhanced styling */}
      <Typography
        variant='h6'
        color='text.secondary'
        sx={{
          fontWeight: 500,
          opacity: 0.8,
          position: 'relative',
          zIndex: 1,
          mb: 3,
          fontSize: { xs: '1rem', sm: '1.1rem' },
        }}
      >
        Manage and organize your project tasks efficiently
      </Typography>

      {/* Statistics and Create Button */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          mb: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Statistics */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Chip
            label={`Total: ${totalTasks}`}
            color='primary'
            variant='outlined'
            sx={{ fontWeight: 'bold' }}
          />
          <Chip
            label={`Completed: ${completedTasks}`}
            color='success'
            variant='outlined'
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* Create Task Button */}
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={onCreateTask}
          disabled={isLoading}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 'bold',
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: 'grey.400',
              transform: 'none',
              boxShadow: 'none',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Add New Task
        </Button>
      </Box>

      {/* Decorative line with gradient */}
      <Box
        sx={{
          width: 80,
          height: 4,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          mx: 'auto',
          position: 'relative',
          zIndex: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 2,
            background:
              'linear-gradient(90deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
            filter: 'blur(8px)',
            zIndex: -1,
          },
        }}
      />
    </Box>
  );
}
