import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, type Variants, type AnimationGeneratorType } from 'framer-motion';
import { setGlobalToast } from '../utils/toast';

interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'error';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (type: ToastItem['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast: React.FC<{ toast: ToastItem; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: 'rgba(255, 248, 232, 1)',
          borderColor: 'rgba(34, 197, 94, 1)',
          icon: '✅'
        };
      case 'error':
        return {
          backgroundColor: 'rgba(255, 248, 232, 1)',
          borderColor: 'rgba(239, 68, 68, 1)',
          icon: '❌'
        };
      default:
        return {
          backgroundColor: 'rgba(255, 248, 232, 1)',
          borderColor: 'rgba(255, 111, 46, 1)',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getToastStyles();

  // Toast 动画变体
  const toastVariants: Variants = {
    initial: { 
      opacity: 0, 
      x: 100,
      rotate: 2,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      x: 0,
      rotate: -0.2,
      scale: 1,
      transition: {
        type: "spring" as AnimationGeneratorType,
        stiffness: 300,
        damping: 20,
      }
    },
    exit: { 
      opacity: 0, 
      x: 100,
      rotate: 2,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    },
    hover: {
      x: -3,
      rotate: -0.1,
      boxShadow: '6px 6px 0px rgba(19, 0, 0, 1)',
      transition: {
        type: "spring" as AnimationGeneratorType,
        stiffness: 400,
        damping: 20,
      }
    }
  };

  return (
    <motion.div
      className="relative p-4 border-2 border-solid transition-all font-bold max-w-sm cursor-pointer"
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: 'rgba(19, 0, 0, 1)',
        fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
        boxShadow: '4px 4px 0px rgba(19, 0, 0, 1)'
      }}
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      layout
    >
      <div className="flex items-start gap-3">
        <motion.span 
          className="text-lg font-bold flex-shrink-0 mt-0.5"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        >
          {styles.icon}
        </motion.span>
        <div className="flex-1">
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-bold">
            {toast.message}
          </p>
        </div>
        <motion.button
          onClick={() => onRemove(toast.id)}
          className="ml-2 text-lg font-bold transition-all flex-shrink-0"
          aria-label="关闭"
          style={{ color: 'rgba(19, 0, 0, 1)' }}
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.8 }}
        >
          ×
        </motion.button>
      </div>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastItem['type'], message: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 设置全局 toast 实例
  useEffect(() => {
    setGlobalToast(addToast);
    
    return () => {
      setGlobalToast(null);
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      
      {/* Toast Container - 右下角 */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div className="pointer-events-auto space-y-3">
            {toasts.map(toast => (
              <Toast key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};