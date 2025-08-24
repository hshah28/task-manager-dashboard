'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateProject, deleteProject } from '@/store/slices/projectSlice';
import TaskList from './TaskList';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import ToastNotification from './ToastNotification';

interface ProjectDetailProps {
  project: any;
  onBack: () => void;
}

export default function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const dispatch = useAppDispatch();

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description);

  // Delete project state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);

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

  const [error, setError] = useState<string | null>(null);

  const handleUpdateProject = async () => {
    if (!editName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsUpdating(true);
      await dispatch(
        updateProject({
          projectId: project.id,
          name: editName,
          description: editDescription,
        })
      ).unwrap();

      setOpenEditDialog(false);
      setError(null);
      showToast('Project updated successfully! ✨', 'success');
    } catch {
      setError('Failed to update project');
      showToast('Failed to update project', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteProject(project.id)).unwrap();

      setOpenDeleteDialog(false);
      setIsDeleting(false);
      setError(null);

      showToast('Project deleted successfully! 🗑️', 'success');
      // Navigate back to dashboard after successful deletion
      onBack();
    } catch {
      setError('Failed to delete project');
      showToast('Failed to delete project', 'error');
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setIsDeleting(false);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditName(project.name);
    setEditDescription(project.description);
  };

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setToast({ open: true, message, type });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <Box>
      {/* Header */}
      <Box display='flex' alignItems='center' mb={3}>
        <Box flex={1}>
          <Typography variant='h4' component='h1' gutterBottom>
            {project.name}
          </Typography>
          <Typography variant='body1' color='text.secondary' gutterBottom>
            {project.description}
          </Typography>
          <Box display='flex' gap={1} mt={1}>
            <Chip
              label={`Created: ${format(
                new Date(project.createdAt),
                'MMM dd, yyyy'
              )}`}
              size='small'
              variant='outlined'
            />
            <Chip
              label={`Updated: ${format(
                new Date(project.updatedAt),
                'MMM dd, yyyy'
              )}`}
              size='small'
              variant='outlined'
            />
          </Box>
        </Box>
        <Box>
          <IconButton
            color='primary'
            onClick={() => setOpenEditDialog(true)}
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton color='error' onClick={handleDeleteProject}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
      >
        <Alert
          onClose={handleCloseError}
          severity='error'
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Tasks Section */}
      <TaskList projectId={project.id} />

      {/* Edit Project Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Typography variant='h4' color='white' fontWeight='bold'>
                ✏️
              </Typography>
            </Box>
            <Typography
              variant='h5'
              component='h2'
              fontWeight='bold'
              gutterBottom
            >
              Edit Project
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Update your project details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <TextField
            autoFocus
            margin='normal'
            label='Project Name'
            fullWidth
            variant='outlined'
            value={editName}
            onChange={e => setEditName(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          />
          <TextField
            margin='normal'
            label='Description'
            fullWidth
            variant='outlined'
            multiline
            rows={3}
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleCloseEditDialog}
            variant='outlined'
            disabled={isUpdating}
            sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProject}
            variant='contained'
            disabled={isUpdating}
            startIcon={
              isUpdating ? <CircularProgress size={20} color='inherit' /> : null
            }
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:disabled': {
                boxShadow: 'none',
              },
            }}
          >
            {isUpdating ? 'Updating...' : 'Update Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          },
        }}
      >
        {/* Header with warning icon */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            p: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />

          {/* Warning icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              border: '3px solid rgba(255,255,255,0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              variant='h2'
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              ⚠️
            </Typography>
          </Box>

          <Typography
            variant='h5'
            component='h2'
            sx={{
              color: 'white',
              fontWeight: 'bold',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Delete Project
          </Typography>
        </Box>

        {/* Content */}
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography
            variant='h6'
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Are you sure you want to delete this project?
          </Typography>

          <Box
            sx={{
              bgcolor: 'grey.50',
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'grey.200',
              mb: 3,
            }}
          >
            <Typography
              variant='body1'
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
            >
              &ldquo;{project.name}&rdquo;
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              {project.description}
            </Typography>
          </Box>

          <Typography
            variant='body2'
            color='error.main'
            sx={{ fontWeight: 500 }}
          >
            ⚠️ This action cannot be undone. All tasks in this project will be
            permanently deleted.
          </Typography>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ p: 4, gap: 2, justifyContent: 'center' }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant='outlined'
            disabled={isDeleting}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderColor: 'grey.400',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'grey.600',
                backgroundColor: 'grey.50',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmDelete}
            variant='contained'
            color='error'
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={20} color='inherit' /> : null
            }
            sx={{
              borderRadius: 3,
              px: 5,
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 35px rgba(255, 107, 107, 0.4)',
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
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogActions>
      </Dialog>

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
