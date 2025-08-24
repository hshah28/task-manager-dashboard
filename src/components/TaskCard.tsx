'use client';

import React from 'react';
import { Task } from '@/types';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Pending as PendingIcon,
  CalendarToday as CalendarIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

interface TaskCardProps {
  task: Task;
  isStatusChanging: string | null;
  onStatusChange: (
    taskId: string,
    newStatus: 'Todo' | 'In Progress' | 'Done'
  ) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, task: Task) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

const statusOrder = ['Todo', 'In Progress', 'Done'];

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Todo':
      return <RadioButtonUncheckedIcon />;
    case 'In Progress':
      return <PendingIcon />;
    case 'Done':
      return <CheckCircleIcon />;
    default:
      return <RadioButtonUncheckedIcon />;
  }
};

export default function TaskCard({
  task,
  isStatusChanging,
  onStatusChange,
  onMenuClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: TaskCardProps) {
  const handleStatusChange = () => {
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length] as
      | 'Todo'
      | 'In Progress'
      | 'Done';
    onStatusChange(task.id, nextStatus);
  };

  return (
    <Card
      elevation={2}
      draggable
      onDragStart={e => onDragStart?.(e, task)}
      onDragEnd={onDragEnd}
      sx={{
        mb: 2,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: 'all 0.3s ease',
        '&:hover': {
          elevation: 8,
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        },
        '&:active': {
          cursor: 'grabbing',
        },
        opacity: isStatusChanging === task.id ? 0.7 : 1,
        transform: isDragging ? 'translateY(-8px) scale(1.05)' : 'none',
        boxShadow: isDragging
          ? '0 20px 60px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: isDragging ? 1000 : 'auto',
        position: isDragging ? 'relative' : 'static',
        '&::before': isDragging
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 1,
              bgcolor: 'primary.50',
              opacity: 0.3,
              zIndex: -1,
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Tooltip title={`Click to change status from ${task.status}`}>
            <span>
              <IconButton
                size='small'
                disabled={isStatusChanging === task.id}
                onClick={handleStatusChange}
                sx={{
                  color: getStatusColor(task.status),
                  bgcolor: `${getStatusColor(task.status)}.50`,
                  '&:hover': {
                    bgcolor: `${getStatusColor(task.status)}.100`,
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isStatusChanging === task.id ? (
                  <CircularProgress size={16} color='inherit' />
                ) : (
                  getStatusIcon(task.status)
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='body1'
              fontWeight='bold'
              sx={{
                textDecoration:
                  task.status === 'Done' ? 'line-through' : 'none',
                color:
                  task.status === 'Done' ? 'text.secondary' : 'text.primary',
                mb: 1,
              }}
            >
              {task.title}
            </Typography>

            {task.dueDate && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                <CalendarIcon
                  sx={{
                    fontSize: 16,
                    color: 'text.secondary',
                  }}
                />
                <Typography variant='caption' color='text.secondary'>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: '0.75rem',
                  bgcolor: 'primary.main',
                }}
              >
                {task.title.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant='caption' color='text.secondary'>
                Created{' '}
                {task.createdAt
                  ? new Date(task.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Typography>
            </Box>
          </Box>

          <Tooltip title='More options'>
            <IconButton
              size='small'
              onClick={e => onMenuClick(e, task)}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <MoreVertIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
