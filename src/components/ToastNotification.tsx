'use client';

import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface ToastNotificationProps {
  open: boolean;
  message: string;
  type: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

export default function ToastNotification({
  open,
  message,
  type,
  onClose,
  autoHideDuration = 4000,
}: ToastNotificationProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          borderRadius: 2,
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        icon={getIcon()}
        sx={{
          width: '100%',
          borderRadius: 2,
          fontWeight: 500,
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
