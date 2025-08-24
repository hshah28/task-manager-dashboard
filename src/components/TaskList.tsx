'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  clearError,
} from '@/store/slices/taskSlice';
import { Task } from '@/types';
import { Box, Grid, Alert } from '@mui/material';
import ToastNotification from './ToastNotification';
import TaskListHeader from './TaskListHeader';
import StatusColumn from './StatusColumn';
import TaskDialog from './TaskDialog';
import TaskActionsMenu from './TaskActionsMenu';

interface TaskListProps {
  projectId: string;
}

const statusOrder = ['Todo', 'In Progress', 'Done'];

export default function TaskList({ projectId }: TaskListProps) {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector(
    (state: RootState) => state.tasks
  );
  const { user } = useAppSelector((state: RootState) => state.auth);

  // State for dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // State for form inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState<Date | null>(null);

  // State for actions menu
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user && projectId) {
      dispatch(fetchTasks(projectId));
    }
  }, [dispatch, user, projectId]);

  // Helper function to show toast notifications
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setToast({ open: true, message, type });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  // Task creation
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      setIsCreating(true);
      await dispatch(
        createTask({
          title: newTaskTitle.trim(),
          projectId,
          dueDate: newTaskDueDate?.toISOString(),
        })
      ).unwrap();

      setNewTaskTitle('');
      setNewTaskDueDate(null);
      setOpenCreateDialog(false);
      showToast('Task created successfully!');
    } catch {
      showToast('Failed to create task', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Task editing
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setOpenEditDialog(true);
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !editTaskTitle.trim()) return;

    try {
      setIsUpdating(true);
      await dispatch(
        updateTask({
          taskId: editingTask.id,
          title: editTaskTitle.trim(),
          dueDate: editTaskDueDate?.toISOString(),
        })
      ).unwrap();

      setOpenEditDialog(false);
      setEditingTask(null);
      setEditTaskTitle('');
      setEditTaskDueDate(null);
      showToast('Task updated successfully!');
    } catch {
      showToast('Failed to update task', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Task deletion
  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsDeleting(true);
      await dispatch(deleteTask(taskId)).unwrap();
      showToast('Task deleted successfully!');
    } catch {
      showToast('Failed to delete task', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status change
  const handleStatusChange = async (
    taskId: string,
    newStatus: 'Todo' | 'In Progress' | 'Done'
  ) => {
    try {
      setIsStatusChanging(taskId);
      await dispatch(updateTaskStatus({ taskId, status: newStatus })).unwrap();
      showToast('Task status updated successfully!');
    } catch {
      showToast('Failed to update task status', 'error');
    } finally {
      setIsStatusChanging(null);
    }
  };

  // Menu handling
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  // Error handling
  const handleCloseError = () => {
    dispatch(clearError());
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      setDragOverStatus(status);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      await handleStatusChange(
        draggedTask.id,
        newStatus as 'Todo' | 'In Progress' | 'Done'
      );
    }
    setDraggedTask(null);
    setDragOverStatus(null);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  // Group tasks by status
  const groupedTasks = tasks.reduce(
    (acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  const sortedTasks = statusOrder.map(status => ({
    status,
    tasks: groupedTasks[status] || [],
  }));

  // Loading state
  if (loading) {
    return (
      <Box
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight='500px'
        gap={4}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Box sx={{ fontSize: 60, color: 'white' }}>📋</Box>
        </Box>
        <Box textAlign='center'>
          <Box
            sx={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'text.secondary',
              mb: 2,
            }}
          >
            Loading Your Tasks
          </Box>
          <Box sx={{ color: 'text.secondary' }}>
            Preparing your workspace...
          </Box>
        </Box>
      </Box>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'Done').length;

  return (
    <Box sx={{ p: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header Section */}
      <TaskListHeader
        totalTasks={tasks.length}
        completedTasks={completedTasks}
        onCreateTask={() => setOpenCreateDialog(true)}
        isLoading={isCreating}
      />

      {/* Tasks Grid */}
      <Grid container spacing={4}>
        {sortedTasks.map(({ status, tasks: statusTasks }) => (
          <StatusColumn
            key={status}
            status={status as 'Todo' | 'In Progress' | 'Done'}
            tasks={statusTasks}
            isStatusChanging={isStatusChanging}
            onStatusChange={handleStatusChange}
            onMenuClick={handleMenuOpen}
            isDragOver={dragOverStatus === status}
            onDragOver={e => handleDragOver(e, status)}
            onDrop={e => handleDrop(e, status)}
            onDragLeave={handleDragLeave}
          />
        ))}
      </Grid>

      {/* Create Task Dialog */}
      <TaskDialog
        open={openCreateDialog}
        mode='create'
        title='Create New Task'
        taskTitle={newTaskTitle}
        dueDate={newTaskDueDate}
        onTitleChange={setNewTaskTitle}
        onDueDateChange={setNewTaskDueDate}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
        submitText='Create Task'
      />

      {/* Edit Task Dialog */}
      <TaskDialog
        open={openEditDialog}
        mode='edit'
        title='Edit Task'
        taskTitle={editTaskTitle}
        dueDate={editTaskDueDate}
        onTitleChange={setEditTaskTitle}
        onDueDateChange={setEditTaskDueDate}
        onClose={() => setOpenEditDialog(false)}
        onSubmit={handleUpdateTask}
        isLoading={isUpdating}
        submitText='Update Task'
      />

      {/* Task Actions Menu */}
      <TaskActionsMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        selectedTask={selectedTask}
        isDeleting={isDeleting}
        onClose={handleMenuClose}
        onEdit={handleEditClick}
        onDelete={handleDeleteTask}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity='error' onClose={handleCloseError} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Toast Notification */}
      <ToastNotification
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}
