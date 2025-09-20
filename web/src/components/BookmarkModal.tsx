import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants, type AnimationGeneratorType } from 'framer-motion';
import { createResource } from '../api/methods/resource.methods';
import { createResourcePreviewAsync } from '../api/methods/resource.async.methods';
import type {
    ResourceCreateRequest,
    ResourcePreviewRequest
} from '../api/types/resource.types';
import toast from '../utils/toast';
import LoadingDots from './LoadingDots';
import { useProgress } from '../contexts/ProgressContext';

interface BookmarkModalProps {
  isOpen: boolean;
  url: string;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    title: string;
    digest: string;
    tags: string[];
  };
}

type ModalStep = 'note' | 'preview' | 'edit';

const BookmarkModal: React.FC<BookmarkModalProps> = ({ 
  isOpen, 
  url, 
  onClose, 
  onSuccess,
  initialData
}) => {
  const [step, setStep] = useState<ModalStep>(initialData ? 'edit' : 'note');
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState('');
  const [editData, setEditData] = useState({
    title: initialData?.title || '',
    digest: initialData?.digest || '',
    tags: initialData?.tags || [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  
  const { addTask, updateTask, getTask } = useProgress();

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
    setStep('note');
    setNote('');
    setEditData({ title: '', digest: '', tags: [] });
    setTagInput('');
    setCurrentTaskId(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handlePreview = async () => {
    if (!url.trim()) {
      toast.error('URL不能为空');
      return;
    }

    // 创建进度任务
    const taskId = addTask({
      title: '生成网页预览',
      url: url,
      status: 'pending',
      progress: 0,
      message: '准备开始抓取...'
    });
    
    setCurrentTaskId(taskId);
    
    try {
      const request: ResourcePreviewRequest = {
        url: url,
        note: note,
      };
      
      // 使用异步预览生成
      const preview = await createResourcePreviewAsync(request, (progress) => {
        updateTask(taskId, {
          status: progress.step,
          progress: progress.progress,
          message: progress.message,
          error: progress.error
        });
      });
      
      setEditData({
        title: preview.title,
        digest: preview.digest,
        tags: preview.tags,
      });
      
      // 关闭模态框并跳转到编辑步骤
      handleClose();
      
      // 显示成功消息
      toast.success('预览生成完成，请在右下角查看结果');
      
      // 标记任务完成，并存储结果
      updateTask(taskId, {
        status: 'completed',
        progress: 100,
        message: '预览生成完成',
        result: preview
      });
      
    } catch (error: any) {
      console.error('生成预览失败:', error);
      toast.error(error.message || '生成预览失败，请重试');
      
      // 标记任务失败
      updateTask(taskId, {
        status: 'error',
        progress: 0,
        message: '生成失败',
        error: error.message || '生成预览失败'
      });
    }
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
    
    if (!editData.digest.trim()) {
      toast.error('摘要不能为空');
      return;
    }
    
    if (editData.tags.length === 0) {
      toast.error('至少需要一个标签');
      return;
    }

    setIsLoading(true);
    
    try {
      const request: ResourceCreateRequest = {
        url: url,
        title: editData.title,
        digest: editData.digest,
        tags: editData.tags,
      };
      
      await createResource(request);
      toast.success('收藏成功！');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('创建资源失败:', error);
      toast.error(error.message || '收藏失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const renderNoteStep = () => (
    <>
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: 'rgba(19, 0, 0, 1)' }}>
        收藏链接
      </h3>
      
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
          链接地址
        </label>
        <div 
          className="p-2 sm:p-3 border-2 border-solid text-xs sm:text-sm break-all"
          style={{
            backgroundColor: 'rgba(255, 239, 215, 1)',
            borderColor: 'rgba(19, 0, 0, 1)',
            color: 'rgba(19, 0, 0, 1)',
          }}
        >
          {url}
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
          备注说明 (可选)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="为这个链接添加一些说明，帮助AI更好地生成标题和摘要..."
          className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none focus:border-orange-400 transition-colors resize-none text-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 1)',
            borderColor: 'rgba(19, 0, 0, 1)',
            color: 'rgba(19, 0, 0, 1)',
            fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace'
          }}
          rows={3}
          maxLength={500}
          disabled={isLoading}
        />
        <div className="text-xs mt-1 opacity-60" style={{ color: 'rgba(19, 0, 0, 1)' }}>
          {note.length}/500
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
        onClick={handlePreview}
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
        {isLoading ? <LoadingDots text="生成预览中" /> : '生成预览'}
      </motion.button>
      </div>
    </>
  );

  const renderEditStep = () => (
    <>
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: 'rgba(19, 0, 0, 1)' }}>
        编辑收藏信息
      </h3>

      <div className="max-h-72 sm:max-h-96 overflow-y-auto mb-4 sm:mb-6 pr-1 sm:pr-2 scrollbar-hide">
        {/* 标题 */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            标题 *
          </label>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none focus:border-orange-400 transition-colors text-sm sm:text-base"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 1)',
              borderColor: 'rgba(19, 0, 0, 1)',
              color: 'rgba(19, 0, 0, 1)',
              fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace'
            }}
            maxLength={500}
            disabled={isLoading}
          />
        </div>

        {/* 摘要 */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            摘要 *
          </label>
          <textarea
            value={editData.digest}
            onChange={(e) => setEditData(prev => ({ ...prev, digest: e.target.value }))}
            className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none focus:border-orange-400 transition-colors resize-none text-sm"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 1)',
              borderColor: 'rgba(19, 0, 0, 1)',
              color: 'rgba(19, 0, 0, 1)',
              fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace'
            }}
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* 标签 */}
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            标签 *
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
          onClick={() => setStep('note')}
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
          返回
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
          {isLoading ? <LoadingDots text="保存中" /> : '保存收藏'}
        </motion.button>
      </div>
    </>
  );

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
              {step === 'note' && renderNoteStep()}
              {step === 'edit' && renderEditStep()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookmarkModal;