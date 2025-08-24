'use client';

import React from 'react';
import { Task } from '@/types';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface TaskActionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  selectedTask: Task | null;
  isDeleting: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskActionsMenu({
  anchorEl,
  open,
  selectedTask,
  isDeleting,
  onClose,
  onEdit,
  onDelete,
}: TaskActionsMenuProps) {
  const handleEditClick = () => {
    if (selectedTask) {
      onEdit(selectedTask);
      onClose();
    }
  };

  const handleDeleteClick = () => {
    if (selectedTask) {
      onDelete(selectedTask.id);
      onClose();
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          minWidth: 180,
        },
      }}
    >
      <MenuItem onClick={handleEditClick}>
        <ListItemIcon>
          <EditIcon fontSize='small' />
        </ListItemIcon>
        <ListItemText>Edit Task</ListItemText>
      </MenuItem>

      <Divider />

      <MenuItem
        onClick={handleDeleteClick}
        disabled={isDeleting}
        sx={{ color: 'error.main' }}
      >
        <ListItemIcon>
          {isDeleting ? (
            <CircularProgress size={16} color='error' />
          ) : (
            <DeleteIcon fontSize='small' color='error' />
          )}
        </ListItemIcon>
        <ListItemText>
          {isDeleting ? 'Deleting...' : 'Delete Task'}
        </ListItemText>
      </MenuItem>
    </Menu>
  );
}
