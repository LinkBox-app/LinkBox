import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants, type AnimationGeneratorType } from 'framer-motion';
import { updateResource } from '../api/methods/resource.methods';
import type { ResourceResponse, ResourceUpdate } from '../api/types/resource.types';
import toast from '../utils/toast';
import LoadingDots from './LoadingDots';

interface EditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceResponse;
  onSuccess: () => void;
}

const EditResourceModal: React.FC<EditResourceModalProps> = ({
  isOpen,
  onClose,
  resource,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    title: resource.title,
    digest: resource.digest,
    tags: resource.tags || [],
  });
  const [tagInput, setTagInput] = useState('');

  // 动画变体
  const modalVariants: Variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      rotate: 0.5,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: -0.2,
      transition: {
        type: "spring" as AnimationGeneratorType,
        stiffness: 300,
        damping: 20,
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      rotate: -0.5,
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
    setEditData({
      title: resource.title,
      digest: resource.digest,
      tags: resource.tags || [],
    });
    setTagInput('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !editData.tags.includes(trimmedTag)) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!editData.title.trim()) {
      toast.error('标题不能为空');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: ResourceUpdate = {
        title: editData.title.trim(),
        digest: editData.digest.trim(),
        tags: editData.tags,
      };

      await updateResource(resource.id, updateData);
      toast.success('资源更新成功！');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('更新资源失败:', error);
      toast.error(error.message || '更新资源失败，请重试');
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
            className="relative max-w-2xl w-full mx-3 sm:mx-4 border-2 border-solid p-4 sm:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
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
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-lg sm:text-xl font-bold transition-opacity z-10 p-1 sm:p-0"
              style={{ color: 'rgba(19, 0, 0, 1)' }}
              disabled={isLoading}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            编辑资源信息
          </h3>

          {/* URL 显示 */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              链接地址
            </label>
            <div 
              className="p-2 sm:p-3 border-2 border-solid text-xs sm:text-sm break-all opacity-70"
              style={{
                backgroundColor: 'rgba(255, 239, 215, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
              }}
            >
              {resource.url}
            </div>
          </div>

          <div className="max-h-72 sm:max-h-96 overflow-y-auto mb-4 sm:mb-6 pr-1 sm:pr-2 scrollbar-hide">
            {/* 标题 */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                标题 *
              </label>
              <motion.input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none transition-all text-sm sm:text-base"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(19, 0, 0, 1)',
                  color: 'rgba(19, 0, 0, 1)',
                  fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
                  boxShadow: '3px 3px 0px rgba(19, 0, 0, 0.2)'
                }}
                maxLength={500}
                disabled={isLoading}
                placeholder="输入资源标题"
                whileFocus={{ 
                  boxShadow: '4px 4px 0px rgba(255, 111, 46, 0.3)',
                  x: -1,
                  y: -1
                }}
              />
            </div>

            {/* 摘要 */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                摘要
              </label>
              <motion.textarea
                value={editData.digest}
                onChange={(e) => setEditData(prev => ({ ...prev, digest: e.target.value }))}
                className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none transition-all resize-none text-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(19, 0, 0, 1)',
                  color: 'rgba(19, 0, 0, 1)',
                  fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
                  boxShadow: '3px 3px 0px rgba(19, 0, 0, 0.2)'
                }}
                rows={3}
                disabled={isLoading}
                placeholder="输入资源摘要"
                whileFocus={{ 
                  boxShadow: '4px 4px 0px rgba(255, 111, 46, 0.3)',
                  x: -1,
                  y: -1
                }}
              />
            </div>

            {/* 标签 */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                标签
              </label>
              
              {/* 已有标签 */}
              {editData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                  {editData.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 border-2 border-solid text-xs sm:text-sm font-bold"
                      style={{
                        backgroundColor: 'rgba(255, 111, 46, 0.1)',
                        borderColor: 'rgba(255, 111, 46, 1)',
                        color: 'rgba(19, 0, 0, 1)',
                        boxShadow: '2px 2px 0px rgba(19, 0, 0, 0.3)'
                      }}
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: -0.5 }}
                      exit={{ scale: 0, rotate: 10 }}
                      whileHover={{ 
                        x: -1,
                        y: -1,
                        boxShadow: '3px 3px 0px rgba(19, 0, 0, 0.3)'
                      }}
                    >
                      #{tag}
                      <motion.button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:opacity-70 transition-opacity p-1 -m-1"
                        disabled={isLoading}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        ×
                      </motion.button>
                    </motion.span>
                  ))}
                </div>
              )}
              
              {/* 添加标签 */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入标签名称"
                  className="flex-1 p-2 border-2 border-solid focus:outline-none focus:border-orange-400 transition-colors text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                    fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace'
                  }}
                  disabled={isLoading}
                />
                <motion.button
                  onClick={handleAddTag}
                  disabled={isLoading || !tagInput.trim()}
                  className="px-3 sm:px-4 py-2 border-2 border-solid font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm min-h-[40px] flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(255, 248, 232, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                    boxShadow: '2px 2px 0px rgba(19, 0, 0, 0.5)'
                  }}
                  whileHover={{ 
                    x: -1,
                    y: -1,
                    boxShadow: '3px 3px 0px rgba(19, 0, 0, 0.5)'
                  }}
                  whileTap={{ 
                    x: 1,
                    y: 1,
                    boxShadow: '1px 1px 0px rgba(19, 0, 0, 0.5)'
                  }}
                >
                  添加
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <motion.button
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
              onClick={handleSave}
              disabled={isLoading}
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
              {isLoading ? <LoadingDots text="保存中" /> : '保存更改'}
            </motion.button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditResourceModal;