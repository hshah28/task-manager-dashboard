import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
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

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId: string) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`/api/tasks?projectId=${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const data = await response.json();
    return data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({
    title,
    projectId,
    dueDate,
  }: {
    title: string;
    projectId: string;
    dueDate?: string;
  }) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, projectId, dueDate }),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    const data = await response.json();
    return data;
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    const data = await response.json();
    return data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({
    taskId,
    title,
    dueDate,
  }: {
    taskId: string;
    title?: string;
    dueDate?: string;
  }) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, dueDate }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    const data = await response.json();
    return data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    return { taskId };
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearTasks: state => {
      state.tasks = [];
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload.task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create task';
      })
      // Update Task Status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          task => task.id === action.payload.task.id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update task';
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          task => task.id === action.payload.task.id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload.task;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update task';
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(
          task => task.id !== action.payload.taskId
        );
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete task';
      });
  },
});

export const { clearError, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
