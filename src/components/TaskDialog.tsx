'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface TaskDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  title: string;
  taskTitle: string;
  dueDate: Date | null;
  onTitleChange: (title: string) => void;
  onDueDateChange: (date: Date | null) => void;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  submitText: string;
}

export default function TaskDialog({
  open,
  mode,
  title,
  taskTitle,
  dueDate,
  onTitleChange,
  onDueDateChange,
  onClose,
  onSubmit,
  isLoading,
  submitText,
}: TaskDialogProps) {
  const isCreate = mode === 'create';
  const Icon = isCreate ? AddIcon : EditIcon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            }}
          >
            <Icon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography
            variant='h4'
            component='h2'
            fontWeight='bold'
            gutterBottom
          >
            {title}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {isCreate
              ? 'Add a new task to your project'
              : 'Update your task details'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        <TextField
          autoFocus
          margin='normal'
          label='Task Title'
          fullWidth
          variant='outlined'
          value={taskTitle}
          onChange={e => onTitleChange(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label='Due Date (Optional)'
            value={dueDate}
            onChange={date => onDueDateChange(date)}
            slotProps={{
              textField: {
                fullWidth: true,
                variant: 'outlined',
                InputProps: {
                  sx: { borderRadius: 2 },
                },
              },
            }}
          />
        </LocalizationProvider>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, gap: 2 }}>
        <Button
          onClick={onClose}
          variant='outlined'
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 4, fontWeight: 'bold' }}
        >
          Cancel
        </Button>

        <Button
          onClick={onSubmit}
          variant='contained'
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color='inherit' /> : null
          }
          sx={{
            borderRadius: 2,
            px: 5,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            '&:disabled': {
              background: 'grey.400',
              boxShadow: 'none',
            },
          }}
        >
          {isLoading ? 'Processing...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
