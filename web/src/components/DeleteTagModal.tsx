import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants, type AnimationGeneratorType } from 'framer-motion';
import { deleteTag } from '../api/methods/tag.methods';
import toast from '../utils/toast';
import LoadingDots from './LoadingDots';

interface DeleteTagModalProps {
  isOpen: boolean;
  tagName: string;
  tagId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteTagModal: React.FC<DeleteTagModalProps> = ({ 
  isOpen, 
  tagName, 
  tagId,
  onClose, 
  onSuccess 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // 动画变体
  const modalVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      rotate: -0.5,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0.2,
      transition: {
        type: "spring" as AnimationGeneratorType,
        stiffness: 300,
        damping: 20,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      rotate: 0.5,
      transition: {
        duration: 0.2
      }
    }
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const warningVariants: Variants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        delay: 0.2,
        type: "spring" as AnimationGeneratorType,
        stiffness: 300,
        damping: 20,
      }
    }
  };

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    
    try {
      await deleteTag(tagId);
      toast.success('标签删除成功！');
      onClose();
      onSuccess();
    } catch (error: any) {
      console.error('删除标签失败:', error);
      toast.error(error.message || '删除标签失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="relative max-w-md w-full mx-3 sm:mx-4 border-2 border-solid p-4 sm:p-6"
            style={{
              backgroundColor: 'rgba(255, 248, 232, 1)',
              borderColor: 'rgba(19, 0, 0, 1)',
              fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
              boxShadow: '6px 6px 0px rgba(19, 0, 0, 1)'
            }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* 关闭按钮 */}
            <motion.button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-lg sm:text-xl font-bold transition-opacity p-1 sm:p-0"
              style={{ color: 'rgba(19, 0, 0, 1)' }}
              disabled={isLoading}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>

        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            删除标签确认
          </h3>
          
          <div className="mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              您确定要删除标签 
              <motion.span 
                className="px-2 py-1 mx-1 border-2 border-solid font-bold inline-block text-xs sm:text-sm"
                style={{
                  backgroundColor: 'rgba(255, 111, 46, 0.2)',
                  borderColor: 'rgba(255, 111, 46, 1)',
                  color: 'rgba(19, 0, 0, 1)',
                  boxShadow: '2px 2px 0px rgba(19, 0, 0, 0.3)'
                }}
                initial={{ scale: 0, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              >
                #{tagName}
              </motion.span> 
              吗？
            </p>
            <motion.div 
              className="p-2 sm:p-3 border-2 border-solid text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: 'rgba(239, 68, 68, 1)',
                color: 'rgba(19, 0, 0, 1)',
                boxShadow: '3px 3px 0px rgba(239, 68, 68, 0.3)'
              }}
              variants={warningVariants}
              initial="initial"
              animate="animate"
            >
              ⚠️ 警告：删除标签后，该标签与所有资源的关联关系也将被删除，此操作不可恢复。
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <motion.button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 p-2 sm:p-3 border-2 border-solid font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base min-h-[44px] flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 248, 232, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
                boxShadow: '3px 3px 0px rgba(19, 0, 0, 0.5)'
              }}
              whileHover={{ 
                x: -1,
                y: -1,
                boxShadow: '4px 4px 0px rgba(19, 0, 0, 0.5)'
              }}
              whileTap={{ 
                x: 1,
                y: 1,
                boxShadow: '2px 2px 0px rgba(19, 0, 0, 0.5)'
              }}
            >
              取消
            </motion.button>
            <motion.button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="flex-1 p-2 sm:p-3 border-2 border-solid font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base min-h-[44px] flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(255, 255, 255, 1)',
                boxShadow: '4px 4px 0px rgba(19, 0, 0, 1)'
              }}
              whileHover={{ 
                x: -1,
                y: -1,
                boxShadow: '6px 6px 0px rgba(19, 0, 0, 1)',
                backgroundColor: 'rgba(220, 38, 38, 1)'
              }}
              whileTap={{ 
                x: 1,
                y: 1,
                boxShadow: '2px 2px 0px rgba(19, 0, 0, 1)'
              }}
            >
              {isLoading ? <LoadingDots text="删除中" /> : '确认删除'}
            </motion.button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteTagModal;