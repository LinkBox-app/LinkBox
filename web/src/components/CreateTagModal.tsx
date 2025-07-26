import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants, type AnimationGeneratorType } from 'framer-motion';
import { createTag, type TagCreateRequest } from '../api/methods/tag.methods';
import toast from '../utils/toast';
import LoadingDots from './LoadingDots';

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTagModal: React.FC<CreateTagModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [tagName, setTagName] = useState('');
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

  if (!isOpen) return null;

  const resetModal = () => {
    setTagName('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) {
      toast.error('标签名称不能为空');
      return;
    }

    if (tagName.trim().length > 50) {
      toast.error('标签名称不能超过50个字符');
      return;
    }

    setIsLoading(true);
    
    try {
      const request: TagCreateRequest = {
        name: tagName.trim(),
      };
      
      await createTag(request);
      toast.success('标签创建成功！');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('创建标签失败:', error);
      toast.error(error.message || '创建标签失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
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
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-lg sm:text-xl font-bold transition-opacity p-1 sm:p-0"
              style={{ color: 'rgba(19, 0, 0, 1)' }}
              disabled={isLoading}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>

        <form onSubmit={handleSubmit}>
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            创建新标签
          </h3>
          
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              标签名称 *
            </label>
            <motion.input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入标签名称..."
              className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none transition-all text-sm sm:text-base"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
                fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
                boxShadow: '3px 3px 0px rgba(19, 0, 0, 0.2)'
              }}
              maxLength={50}
              disabled={isLoading}
              autoFocus
              whileFocus={{ 
                boxShadow: '4px 4px 0px rgba(255, 111, 46, 0.3)',
                x: -1,
                y: -1
              }}
            />
            <div className="text-xs mt-1 opacity-60" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              {tagName.length}/50
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <motion.button
              type="button"
              onClick={handleClose}
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
              type="submit"
              disabled={isLoading || !tagName.trim()}
              className="flex-1 p-2 sm:p-3 border-2 border-solid font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base min-h-[44px] flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 111, 46, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
                boxShadow: '4px 4px 0px rgba(19, 0, 0, 1)'
              }}
              whileHover={{ 
                x: -1,
                y: -1,
                boxShadow: '6px 6px 0px rgba(19, 0, 0, 1)',
                rotate: 0.5
              }}
              whileTap={{ 
                x: 1,
                y: 1,
                boxShadow: '2px 2px 0px rgba(19, 0, 0, 1)'
              }}
            >
              {isLoading ? <LoadingDots text="创建中" /> : '创建标签'}
            </motion.button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateTagModal;