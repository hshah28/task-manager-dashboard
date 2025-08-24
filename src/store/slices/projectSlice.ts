import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Project } from '@/types';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

// Helper function to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch('/api/projects', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }

    return await response.json();
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({ name, description }: { name: string; description: string }) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return await response.json();
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({
    projectId,
    name,
    description,
  }: {
    projectId: string;
    name: string;
    description: string;
  }) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    return await response.json();
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    return { projectId };
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      // Create Project
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload.project);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create project';
      })
      // Update Project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          project => project.id === action.payload.project.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload.project;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update project';
      })
      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          project => project.id !== action.payload.projectId
        );
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete project';
      });
  },
});

export const { clearError } = projectSlice.actions;
export default projectSlice.reducer;
