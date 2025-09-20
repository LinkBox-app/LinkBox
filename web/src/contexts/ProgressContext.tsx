import React, { createContext, useContext, ReactNode } from 'react';
import { useProgressTasks } from '../hooks/useProgressTasks';
import type { ProgressTask } from '../components/ProgressFloatingWindow';

interface ProgressContextType {
  tasks: ProgressTask[];
  addTask: (task: Omit<ProgressTask, 'id' | 'createdAt'>) => string;
  updateTask: (taskId: string, updates: Partial<ProgressTask>) => void;
  removeTask: (taskId: string) => void;
  clearCompleted: () => void;
  getTask: (taskId: string) => ProgressTask | undefined;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const progressTasks = useProgressTasks();

  return (
    <ProgressContext.Provider value={progressTasks}>
      {children}
    </ProgressContext.Provider>
  );
};