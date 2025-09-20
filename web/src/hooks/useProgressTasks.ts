import { useState, useCallback } from 'react';
import type { ProgressTask } from '../components/ProgressFloatingWindow';

export const useProgressTasks = () => {
  const [tasks, setTasks] = useState<ProgressTask[]>([]);

  const addTask = useCallback((task: Omit<ProgressTask, 'id' | 'createdAt'>) => {
    const newTask: ProgressTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    
    setTasks(prev => [newTask, ...prev]);
    return newTask.id;
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<ProgressTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(task => 
      task.status !== 'completed' && task.status !== 'error'
    ));
  }, []);

  const getTask = useCallback((taskId: string) => {
    return tasks.find(task => task.id === taskId);
  }, [tasks]);

  return {
    tasks,
    addTask,
    updateTask,
    removeTask,
    clearCompleted,
    getTask
  };
};