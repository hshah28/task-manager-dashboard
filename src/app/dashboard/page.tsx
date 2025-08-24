'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/store/slices/projectSlice';
import { Project } from '@/types';
import StaticHeader from '@/components/StaticHeader';
import ToastNotification from '@/components/ToastNotification';
import AuthLoadingScreen from '@/components/AuthLoadingScreen';
import {
  Box,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    initialized,
  } = useAppSelector((state: RootState) => state.auth);
  const { projects, loading: projectsLoading } = useAppSelector(
    (state: RootState) => state.projects
  );

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Edit project state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');

  // Delete project state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading states for different actions
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (user) {
      dispatch(fetchProjects());
    }
  }, [dispatch, user]);

  // Reset viewing project loading state when component unmounts
  useEffect(() => {
    return () => {
      setViewingProjectId(null);
    };
  }, []);

  const handleProjectSelect = async (project: Project) => {
    // Set loading state for this specific project
    setViewingProjectId(project.id);

    try {
      // Navigate to project detail page
      router.push(`/project/${project.id}`);
    } catch (error) {
      // Reset loading state if navigation fails
      setViewingProjectId(null);
      console.error('Navigation failed:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsCreating(true);
      await dispatch(
        createProject({
          name: newProjectName,
          description: newProjectDescription,
        })
      ).unwrap();

      setNewProjectName('');
      setNewProjectDescription('');
      setOpenCreateDialog(false);
      setError(null);
      showToast('Project created successfully! 🎉', 'success');
    } catch {
      setError('Failed to create project');
      showToast('Failed to create project', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setEditProjectDescription(project.description);
    setOpenEditDialog(true);
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setIsUpdating(true);
      await dispatch(
        updateProject({
          projectId: editingProject.id,
          name: editProjectName,
          description: editProjectDescription,
        })
      ).unwrap();

      setOpenEditDialog(false);
      setEditingProject(null);
      setEditProjectName('');
      setEditProjectDescription('');
      setError(null);
      showToast('Project updated successfully! ✨', 'success');
    } catch {
      setError('Failed to update project');
      showToast('Failed to update project', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingProject(null);
    setEditProjectName('');
    setEditProjectDescription('');
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;

    try {
      setIsDeleting(true);
      await dispatch(deleteProject(deletingProject.id)).unwrap();

      setOpenDeleteDialog(false);
      setDeletingProject(null);
      setIsDeleting(false);
      setError(null);

      showToast('Project deleted successfully! 🗑️', 'success');
    } catch {
      setError('Failed to delete project');
      showToast('Failed to delete project', 'error');
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingProject(null);
    setIsDeleting(false);
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (initialized && !authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, initialized, router]);

  // Show loading state while checking authentication
  if (!initialized || authLoading) {
    return <AuthLoadingScreen />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Show projects list view
  return (
    <Box sx={{ flexGrow: 1 }}>
      <StaticHeader />

      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        {/* Create Project Button - Positioned below header */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Button
            variant='contained'
            startIcon={
              isCreating ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <AddIcon />
              )
            }
            onClick={() => setOpenCreateDialog(true)}
            disabled={isCreating}
            sx={{
              borderRadius: 3,
              p: 2,
              fontWeight: 'bold',
              fontSize: '0.9rem',
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
            {isCreating ? 'Creating...' : 'Create New Project'}
          </Button>
        </Box>

        {/* Innovative Projects Header */}
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
            variant='h4'
            component='h4'
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '2.5rem' },
              position: 'relative',
              zIndex: 1,
              mb: 2,
              textShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            }}
          >
            My Projects
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
            Manage your projects and tasks efficiently
          </Typography>

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

        {projectsLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={40} />
            <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
              Loading your projects...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project: Project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          variant='h6'
                          color='white'
                          fontWeight='bold'
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='h6'
                          component='h2'
                          fontWeight='bold'
                          gutterBottom
                        >
                          {project.name}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ lineHeight: 1.5 }}
                        >
                          {project.description}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Typography variant='caption' color='text.secondary'>
                        Created:{' '}
                        {project.createdAt
                          ? new Date(project.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant='contained'
                      size='medium'
                      onClick={() => handleProjectSelect(project)}
                      disabled={viewingProjectId === project.id}
                      startIcon={
                        viewingProjectId === project.id ? (
                          <CircularProgress size={16} color='inherit' />
                        ) : null
                      }
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        fontWeight: 'bold',
                        flex: 1,
                        mr: 1,
                        '&:disabled': {
                          opacity: 0.7,
                        },
                      }}
                    >
                      {viewingProjectId === project.id
                        ? 'Loading...'
                        : 'View Tasks'}
                    </Button>
                    <Button
                      variant='outlined'
                      size='medium'
                      onClick={() => handleEditProject(project)}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        fontWeight: 'bold',
                        mr: 1,
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant='outlined'
                      color='error'
                      size='medium'
                      onClick={() => handleDeleteProject(project)}
                      sx={{
                        borderRadius: 2,
                        px: 2,
                        fontWeight: 'bold',
                        borderColor: 'error.main',
                        color: 'error.main',
                        '&:hover': {
                          borderColor: 'error.dark',
                          backgroundColor: 'error.main',
                          color: 'white',
                        },
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {projects.length === 0 && !projectsLoading && (
          <Box
            textAlign='center'
            sx={{
              mt: 8,
              p: 6,
              bgcolor: 'grey.50',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'grey.300',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <AddIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant='h5'
              color='text.secondary'
              gutterBottom
              fontWeight='bold'
            >
              No projects yet
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              Create your first project to start organizing your tasks
            </Typography>
            <Button
              variant='contained'
              size='large'
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                borderRadius: 2,
                p: 1.5,
                fontWeight: 'bold',
                fontSize: '1.1rem',
              }}
            >
              Create Your First Project
            </Button>
          </Box>
        )}
      </Container>

      {/* Create Project Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
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
              <AddIcon sx={{ fontSize: 30, color: 'white' }} />
            </Box>
            <Typography
              variant='h5'
              component='h2'
              fontWeight='bold'
              gutterBottom
            >
              Create New Project
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Start organizing your tasks with a new project
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
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
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
            value={newProjectDescription}
            onChange={e => setNewProjectDescription(e.target.value)}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={() => setOpenCreateDialog(false)}
            variant='outlined'
            disabled={isCreating}
            sx={{ borderRadius: 2, px: 3, fontWeight: 'bold' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            variant='contained'
            disabled={isCreating}
            startIcon={
              isCreating ? <CircularProgress size={20} color='inherit' /> : null
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
            {isCreating ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
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
            value={editProjectName}
            onChange={e => setEditProjectName(e.target.value)}
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
            value={editProjectDescription}
            onChange={e => setEditProjectDescription(e.target.value)}
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

          {deletingProject && (
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
                &ldquo;{deletingProject.name}&rdquo;
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {deletingProject.description}
              </Typography>
            </Box>
          )}

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
