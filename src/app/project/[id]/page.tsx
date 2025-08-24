'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjects } from '@/store/slices/projectSlice';
import { Project } from '@/types';
import StaticHeader from '@/components/StaticHeader';
import ProjectDetail from '@/components/ProjectDetail';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import AuthLoadingScreen from '@/components/AuthLoadingScreen';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    user,
    loading: authLoading,
    initialized,
  } = useAppSelector(state => state.auth);
  const { projects, loading: projectsLoading } = useAppSelector(
    state => state.projects
  );

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      dispatch(fetchProjects());
    }
  }, [dispatch, user, params.id]);

  useEffect(() => {
    if (projects.length > 0 && params.id) {
      const foundProject = projects.find(p => p.id === params.id);
      if (foundProject) {
        setProject(foundProject);
      } else {
        // Project not found, redirect to dashboard
        router.push('/dashboard');
      }
      setLoading(false);
    }
  }, [projects, params.id, router]);

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

  if (loading || projectsLoading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <StaticHeader />
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={40} />
            <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
              Loading project...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <StaticHeader />
        <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant='h6' color='text.secondary' gutterBottom>
              Project not found
            </Typography>
            <Button
              variant='contained'
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard')}
              sx={{ mt: 2 }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StaticHeader />

      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant='outlined'
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard')}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 'bold',
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        <ProjectDetail
          project={project}
          onBack={() => router.push('/dashboard')}
        />
      </Container>
    </Box>
  );
}
