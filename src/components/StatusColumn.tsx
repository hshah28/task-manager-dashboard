'use client';

import React from 'react';
import { Task } from '@/types';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import TaskCard from './TaskCard';

interface StatusColumnProps {
  status: 'Todo' | 'In Progress' | 'Done';
  tasks: Task[];
  isStatusChanging: string | null;
  onStatusChange: (
    taskId: string,
    newStatus: 'Todo' | 'In Progress' | 'Done'
  ) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, task: Task) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  draggedTaskId?: string | null;
}

const getStatusGradient = (status: string) => {
  switch (status) {
    case 'Todo':
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    case 'In Progress':
      return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    case 'Done':
      return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Todo':
      return 'default';
    case 'In Progress':
      return 'warning';
    case 'Done':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusHeaderIcon = (status: string) => {
  switch (status) {
    case 'Todo':
      return <AssignmentIcon sx={{ fontSize: 28, color: 'white' }} />;
    case 'In Progress':
      return <PendingIcon sx={{ fontSize: 28, color: 'white' }} />;
    case 'Done':
      return <CheckCircleIcon sx={{ fontSize: 28, color: 'white' }} />;
    default:
      return <AssignmentIcon sx={{ fontSize: 28, color: 'white' }} />;
  }
};

export default function StatusColumn({
  status,
  tasks,
  isStatusChanging,
  onStatusChange,
  onMenuClick,
  isDragOver,
  onDragOver,
  onDrop,
  onDragLeave,
  onDragStart,
  onDragEnd,
  draggedTaskId,
}: StatusColumnProps) {
  return (
    <Grid item xs={12} md={4}>
      <Paper
        elevation={isDragOver ? 8 : 2}
        sx={{
          borderRadius: 3,
          bgcolor: isDragOver ? 'action.hover' : 'background.paper',
          border: isDragOver ? '3px dashed' : '1px solid',
          borderColor: isDragOver ? 'primary.main' : 'divider',
          minHeight: 400,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: getStatusGradient(status),
          },
          transition: 'all 0.3s ease',
          '&:hover': {
            elevation: 4,
            transform: 'translateY(-2px)',
          },
          transform: isDragOver ? 'scale(1.02)' : 'none',
          boxShadow: isDragOver
            ? '0 8px 32px rgba(25, 118, 210, 0.2)'
            : '0 2px 8px rgba(0,0,0,0.1)',
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
      >
        <Box sx={{ p: 3 }}>
          {/* Status Column Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: getStatusGradient(status),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'spin 3s linear infinite',
                },
              }}
            >
              {getStatusHeaderIcon(status)}
            </Box>
            <Typography
              variant='h5'
              component='h3'
              fontWeight='bold'
              gutterBottom
            >
              {status}
            </Typography>
            <Chip
              label={`${tasks.length} tasks`}
              size='medium'
              color={getStatusColor(status)}
              variant='outlined'
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary',
              }}
            >
              <AssignmentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
              <Typography variant='body2'>
                No {status.toLowerCase()} tasks
              </Typography>
            </Box>
          ) : (
            <Box>
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isStatusChanging={isStatusChanging}
                  onStatusChange={onStatusChange}
                  onMenuClick={onMenuClick}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  isDragging={draggedTaskId === task.id}
                />
              ))}
            </Box>
          )}

          {isDragOver && (
            <Box
              sx={{
                mt: 2,
                p: 3,
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                bgcolor: 'primary.50',
                textAlign: 'center',
                opacity: 0.8,
                animation: 'pulse 1.5s infinite',
              }}
            >
              <Typography
                variant='body2'
                color='primary.main'
                fontWeight='bold'
              >
                Drop task here to move to {status}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Grid>
  );
}
