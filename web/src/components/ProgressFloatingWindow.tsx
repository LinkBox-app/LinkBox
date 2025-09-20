import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingDots from './LoadingDots';

export interface ProgressTask {
  id: string;
  title: string;
  url: string;
  status: 'pending' | 'fetching' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  result?: any;
  error?: string;
  createdAt: Date;
}

interface ProgressFloatingWindowProps {
  tasks: ProgressTask[];
  onTaskClick?: (task: ProgressTask) => void;
  onTaskRemove?: (taskId: string) => void;
  onClearCompleted?: () => void;
  onPreviewComplete?: (previewData: any, url: string) => void;
}

const ProgressFloatingWindow: React.FC<ProgressFloatingWindowProps> = ({
  tasks,
  onTaskClick,
  onTaskRemove,
  onClearCompleted,
  onPreviewComplete
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const activeTasks = tasks.filter(task => task.status === 'pending' || task.status === 'fetching' || task.status === 'processing');
  const completedTasks = tasks.filter(task => task.status === 'completed' || task.status === 'error');

  if (tasks.length === 0 || !isVisible) {
    return null;
  }

  const getStatusIcon = (status: ProgressTask['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'fetching': return '🌐';
      case 'processing': return '⚡';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⚙️';
    }
  };

  const getStatusColor = (status: ProgressTask['status']) => {
    switch (status) {
      case 'pending': return 'rgba(255, 193, 7, 1)';
      case 'fetching': return 'rgba(13, 110, 253, 1)';
      case 'processing': return 'rgba(255, 111, 46, 1)';
      case 'completed': return 'rgba(25, 135, 84, 1)';
      case 'error': return 'rgba(220, 53, 69, 1)';
      default: return 'rgba(108, 117, 125, 1)';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  };

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 max-w-sm w-80"
      initial={{ opacity: 0, x: 100, y: 100 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100, y: 100 }}
      style={{
        fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace'
      }}
    >
      <motion.div
        className="border-2 border-solid shadow-lg overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 248, 232, 1)',
          borderColor: 'rgba(19, 0, 0, 1)',
          boxShadow: '4px 4px 0px rgba(19, 0, 0, 1)'
        }}
        layout
      >
        {/* 标题栏 */}
        <div 
          className="flex items-center justify-between p-3 border-b-2 border-solid cursor-pointer"
          style={{ 
            backgroundColor: 'rgba(255, 111, 46, 1)',
            borderColor: 'rgba(19, 0, 0, 1)',
            color: 'rgba(19, 0, 0, 1)'
          }}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">抓取进度</span>
            <span className="text-xs opacity-70">
              ({activeTasks.length} 进行中, {completedTasks.length} 已完成)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {completedTasks.length > 0 && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearCompleted?.();
                }}
                className="text-xs px-2 py-1 border border-solid hover:opacity-70 transition-opacity"
                style={{
                  backgroundColor: 'rgba(255, 248, 232, 1)',
                  borderColor: 'rgba(19, 0, 0, 1)',
                  color: 'rgba(19, 0, 0, 1)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                清除
              </motion.button>
            )}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="text-lg font-bold hover:opacity-70 transition-opacity"
              style={{ color: 'rgba(19, 0, 0, 1)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMinimized ? '▲' : '▼'}
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="text-lg font-bold hover:opacity-70 transition-opacity"
              style={{ color: 'rgba(19, 0, 0, 1)' }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          </div>
        </div>

        {/* 任务列表 */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-h-80 overflow-y-auto"
            >
              <div className="p-2 space-y-2">
                {/* 进行中的任务 */}
                {activeTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-2 border border-solid cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                      borderColor: 'rgba(19, 0, 0, 1)',
                      color: 'rgba(19, 0, 0, 1)'
                    }}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="animate-pulse">{getStatusIcon(task.status)}</span>
                        <span className="text-xs font-bold truncate flex-1">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-xs opacity-60">
                        {task.progress}%
                      </span>
                    </div>
                    
                    <div className="text-xs opacity-70 mb-2 truncate">
                      {task.message}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: getStatusColor(task.status),
                          width: `${task.progress}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-50 truncate flex-1">
                        {task.url.length > 25 ? `${task.url.substring(0, 25)}...` : task.url}
                      </span>
                      <span className="text-xs opacity-50">
                        {formatTimeAgo(task.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* 已完成的任务 */}
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-2 border border-solid cursor-pointer hover:opacity-80 transition-opacity relative group"
                    style={{
                      backgroundColor: task.status === 'completed' 
                        ? 'rgba(240, 253, 244, 1)' 
                        : 'rgba(254, 242, 242, 1)',
                      borderColor: getStatusColor(task.status),
                      color: 'rgba(19, 0, 0, 1)'
                    }}
                    onClick={() => {
                      if (task.status === 'completed' && task.result) {
                        onPreviewComplete?.(task.result, task.url);
                      } else {
                        onTaskClick?.(task);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{getStatusIcon(task.status)}</span>
                        <span className="text-xs font-bold truncate flex-1">
                          {task.title}
                        </span>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskRemove?.(task.id);
                        }}
                        className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        style={{ color: 'rgba(19, 0, 0, 1)' }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        ×
                      </motion.button>
                    </div>
                    
                    <div className="text-xs opacity-70 mb-1 truncate">
                      {task.status === 'error' ? task.error : '处理完成'}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs opacity-50 truncate flex-1">
                        {task.url.length > 25 ? `${task.url.substring(0, 25)}...` : task.url}
                      </span>
                      <span className="text-xs opacity-50">
                        {formatTimeAgo(task.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {tasks.length === 0 && (
                  <div 
                    className="p-4 text-center text-xs opacity-60"
                    style={{ color: 'rgba(19, 0, 0, 1)' }}
                  >
                    暂无任务
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default ProgressFloatingWindow;