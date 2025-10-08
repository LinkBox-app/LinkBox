import { useRequest } from 'alova/client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getResources, getResourcesByTag } from '../api/methods/resource.methods';
import { getUserTags } from '../api/methods/tag.methods';
import type { ResourceResponse } from '../api/types/resource.types';
import AuthModal from '../components/AuthModal';
import BookmarkModal from '../components/BookmarkModal';
import CreateTagModal from '../components/CreateTagModal';
import DeleteTagModal from '../components/DeleteTagModal';
import EditResourceModal from '../components/EditResourceModal';
import LoadingDots from '../components/LoadingDots';
import { useAuth } from '../hooks/useAuth';
import toast from '../utils/toast';

const Home: React.FC = () => {
  const { isAuthenticated, user, isLoading: authLoading, refreshAuth } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [showDeleteTagModal, setShowDeleteTagModal] = useState(false);
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<{ id: number; name: string } | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceResponse | null>(null);
  
  // 收藏链接相关状态
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  
  // 标签和资源相关状态
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  
  // 使用useRequest管理标签请求
  const {
    loading: isLoadingTags,
    data: tagsResponse,
    send: refreshTags
  } = useRequest(getUserTags, { immediate: false, force: true });
  
  // 从响应中提取标签数组
  const tags = Array.isArray(tagsResponse) ? tagsResponse : [];
  
  // 使用useRequest管理资源请求
  const {
    loading: isLoadingResources,
    data: resourcesResponse,
    send: refreshResources
  } = useRequest(
    (
      params: { tag?: string | null; page?: number; size?: number } = {}
    ) => {
      const { tag, page = 1, size = 20 } = params;
      return tag
        ? getResourcesByTag(tag, page, size)
        : getResources(page, size);
    },
    { immediate: false, force: true }
  );
  
  // 从响应中提取数据
  const resources = resourcesResponse?.resources || [];
  const pagination = resourcesResponse ? {
    total: resourcesResponse.total,
    page: resourcesResponse.page,
    size: resourcesResponse.size,
    pages: resourcesResponse.pages,
  } : { total: 0, page: 1, size: 20, pages: 0 };

  // 检查登录状态，未登录则显示登录模态框
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [authLoading, isAuthenticated]);

  // 检测屏幕大小
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 用户登录后加载标签
  useEffect(() => {
    if (isAuthenticated) {
      refreshTags();
    }
  }, [isAuthenticated]);

  // 根据标签选择加载资源
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    setCurrentPage(1);

    if (selectedTag) {
      refreshResources({ tag: selectedTag, page: 1 });
    } else {
      refreshResources({ page: 1 });
    }
  }, [isAuthenticated, selectedTag]);

  // 当标签列表变化时，校验当前选择是否仍然存在
  useEffect(() => {
    if (!selectedTag) {
      return;
    }

    const exists = tags.some((tag) => tag.name === selectedTag);
    if (!exists) {
      setSelectedTag(null);
    }
  }, [tags, selectedTag]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    refreshAuth();
  };

  const handleBookmarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmarkUrl.trim()) {
      toast.error('请输入有效的链接');
      return;
    }
    
    try {
      new URL(bookmarkUrl);
      setShowBookmarkModal(true);
    } catch {
      toast.error('请输入有效的URL格式');
    }
  };

  const handleBookmarkSuccess = () => {
    setBookmarkUrl('');
    
    // 清除 alova 相关缓存，强制重新请求数据
    refreshTags({ force: true }); // 强制重新加载标签，跳过缓存
    setCurrentPage(1);
    const options = { force: true };
    if (selectedTag) {
      refreshResources({ tag: selectedTag, page: 1 }, options);
    } else {
      refreshResources({ page: 1 }, options);
    }
  };

  const handleCreateTagSuccess = () => {
    // 强制重新加载标签，跳过缓存
    refreshTags({ force: true });
  };

  const handleDeleteTag = (tagId: number, tagName: string) => {
    setTagToDelete({ id: tagId, name: tagName });
    setShowDeleteTagModal(true);
  };

  const handleDeleteTagSuccess = () => {
    // 强制重新加载标签，跳过缓存
    refreshTags({ force: true });
    
    // 如果删除的是当前选中的标签，清空选中状态
    if (tagToDelete && selectedTag === tagToDelete.name) {
      setSelectedTag(null);
    }
    
    setTagToDelete(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) {
      return;
    }

    setCurrentPage(newPage);

    if (selectedTag) {
      refreshResources({ tag: selectedTag, page: newPage });
    } else {
      refreshResources({ page: newPage });
    }
  };

  const handleEditResource = (resource: ResourceResponse) => {
    setResourceToEdit(resource);
    setShowEditResourceModal(true);
  };

  const handleEditResourceSuccess = () => {
    // 强制重新加载当前标签的资源
    if (selectedTag) {
      refreshResources({ tag: selectedTag, page: currentPage });
    } else {
      refreshResources({ page: currentPage });
    }
    setResourceToEdit(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dot-pattern"
        style={{ backgroundColor: 'rgba(255, 239, 215, 1)' }}>
        <div className="text-center">
          <LoadingDots 
            text="初始化中" 
            className="terminal-text text-xl" 
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen dot-pattern" 
      style={{ 
        backgroundColor: 'rgba(255, 239, 215, 1)',
        fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* 顶部收藏栏 */}
      <div className="p-4 sm:p-6 border-b-2 border-solid"
        style={{ borderColor: 'rgba(19, 0, 0, 1)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              LinkBox
            </h1>
            <p className="text-xs sm:text-sm opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              欢迎回来，{user?.username}！收藏您喜欢的链接
            </p>
          </div>
          
          <form onSubmit={handleBookmarkSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="url"
              value={bookmarkUrl}
              onChange={(e) => setBookmarkUrl(e.target.value)}
              placeholder="输入要收藏的链接 (例如: https://github.com/example/repo)"
              className="flex-1 p-2 sm:p-3 border-2 border-solid shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:focus:shadow-[6px_6px_0_rgba(19,0,0,1)] focus:translate-x-[-1px] focus:translate-y-[-1px] sm:focus:translate-x-[-2px] sm:focus:translate-y-[-2px] transition-all text-sm sm:text-base"
              style={{
                backgroundColor: 'rgba(255, 248, 232, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
              }}
            />
            <motion.button
              type="submit"
              className="px-4 py-2 sm:px-6 sm:py-3 border-2 border-solid font-bold shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all text-sm sm:text-base"
              style={{
                backgroundColor: 'rgba(255, 111, 46, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              收藏
            </motion.button>
          </form>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* 标签栏 */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              标签分类
            </h2>
            <motion.button
              onClick={() => setShowCreateTagModal(true)}
              className="px-2 py-1 sm:px-3 sm:py-1 border-2 border-solid font-bold text-xs sm:text-sm shadow-[2px_2px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              style={{
                backgroundColor: 'rgba(255, 111, 46, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + 新建标签
            </motion.button>
          </div>
          
          {isLoadingTags ? (
            <div className="flex items-center">
              <LoadingDots text="加载标签中" className="terminal-text" />
            </div>
          ) : tags.length === 0 ? (
            <div 
              className="p-4 border-2 border-solid transform rotate-[-0.3deg]"
              style={{
                backgroundColor: 'rgba(255, 248, 232, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
              }}
            >
              <p className="text-center">暂无标签，收藏您的第一个链接吧！</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <AnimatePresence>
                  <motion.div
                    key="all"
                    layout
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    whileHover={{ rotate: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-solid font-bold cursor-pointer text-sm sm:text-base ${
                      selectedTag === null
                        ? 'shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)]'
                        : 'shadow-[2px_2px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] sm:hover:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]'
                    } transition-all`}
                    style={{
                      backgroundColor: selectedTag === null ? 'rgba(255, 111, 46, 1)' : 'rgba(255, 248, 232, 1)',
                      borderColor: 'rgba(19, 0, 0, 1)',
                      color: 'rgba(19, 0, 0, 1)',
                    }}
                    onClick={() => setSelectedTag(null)}
                  >
                    全部资源
                  </motion.div>

                  {tags.map((tag) => (
                    <motion.div
                      key={tag.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
                      whileHover={{ rotate: -2, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative group px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-solid font-bold cursor-pointer text-sm sm:text-base ${
                        selectedTag === tag.name
                          ? 'shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)]'
                          : 'shadow-[2px_2px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] sm:hover:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]'
                      } transition-all`}
                      style={{
                        backgroundColor: selectedTag === tag.name ? 'rgba(255, 111, 46, 1)' : 'rgba(255, 248, 232, 1)',
                        borderColor: 'rgba(19, 0, 0, 1)',
                        color: 'rgba(19, 0, 0, 1)',
                      }}
                    >
                      <button
                        onClick={() => setSelectedTag(tag.name)}
                        className="flex-1 text-left"
                      >
                        #{tag.name}
                      </button>

                      {/* 删除按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTag(tag.id, tag.name);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 1)',
                          color: 'rgba(255, 255, 255, 1)',
                        }}
                        title={`删除标签 ${tag.name}`}
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* 创建标签按钮 */}
                <motion.button
                  onClick={() => setShowCreateTagModal(true)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-dashed font-bold hover:border-solid shadow-[2px_2px_0_rgba(19,0,0,0.3)] hover:shadow-[3px_3px_0_rgba(19,0,0,0.5)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all text-sm sm:text-base"
                  style={{
                    backgroundColor: 'rgba(255, 248, 232, 0.5)',
                    borderColor: 'rgba(19, 0, 0, 0.5)',
                    color: 'rgba(19, 0, 0, 0.7)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  + 新建
                </motion.button>
              </div>

              {tags.length === 0 && (
                <div 
                  className="p-4 border-2 border-solid transform rotate-[-0.3deg]"
                  style={{
                    backgroundColor: 'rgba(255, 248, 232, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                  }}
                >
                  <p className="text-center">暂无标签，收藏您的第一个链接吧！</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 资源列表 */}
        {isAuthenticated && (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                {selectedTag ? `#${selectedTag} 资源` : '全部资源'}
              </h3>
              <span className="text-xs sm:text-sm opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                共 {pagination.total} 个资源
              </span>
            </div>

            {isLoadingResources ? (
              <div className="flex items-center justify-center py-8">
                <LoadingDots text="加载资源中" className="terminal-text" />
              </div>
            ) : resources.length === 0 ? (
              <div 
                className="p-6 border-2 border-solid transform rotate-[0.2deg] text-center"
                style={{
                  backgroundColor: 'rgba(255, 248, 232, 1)',
                  borderColor: 'rgba(19, 0, 0, 1)',
                  color: 'rgba(19, 0, 0, 1)',
                }}
              >
                <p>{selectedTag ? '该标签下暂无资源' : '暂无收藏资源，先去收藏一些吧！'}</p>
              </div>
            ) : (
              <>
                {/* 资源卡片 */}
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <AnimatePresence>
                    {resources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        layout
                        initial={{ opacity: 0, y: 20, rotate: -1 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, y: -20, rotate: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ rotate: 0.5, scale: 1.02 }}
                        className="p-3 sm:p-4 border-2 border-solid shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all cursor-pointer"
                        style={{
                          backgroundColor: 'rgba(255, 248, 232, 1)',
                          borderColor: 'rgba(19, 0, 0, 1)',
                          color: 'rgba(19, 0, 0, 1)',
                        }}
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                      <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                        <h4 className="font-bold text-base sm:text-lg leading-tight pr-2 sm:pr-4">
                          {resource.title}
                        </h4>
                        <span className="text-xs opacity-60 whitespace-nowrap">
                          {formatDate(resource.created_at)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm mb-2 sm:mb-3 opacity-80 leading-relaxed">
                        {resource.digest}
                      </p>
                      
                      {/* 标签显示 */}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                          {resource.tags.map((tag, index) => (
                            <motion.span
                              key={index}
                              className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs border border-solid font-bold shadow-[1px_1px_0_rgba(255,111,46,0.5)]"
                              style={{
                                backgroundColor: 'rgba(255, 111, 46, 0.1)',
                                borderColor: 'rgba(255, 111, 46, 1)',
                                color: 'rgba(19, 0, 0, 1)',
                              }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              🏷️ #{tag}
                            </motion.span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm hover:opacity-70 transition-opacity break-all sm:break-normal"
                          style={{ color: 'rgba(255, 111, 46, 1)' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {resource.url.length > (isMobile ? 30 : 50) 
                            ? `${resource.url.substring(0, isMobile ? 30 : 50)}...` 
                            : resource.url}
                        </a>
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditResource(resource);
                          }}
                          className="px-2 py-1 text-xs border border-solid font-bold shadow-[2px_2px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all self-start sm:self-auto"
                          style={{
                            backgroundColor: 'rgba(255, 111, 46, 1)',
                            borderColor: 'rgba(19, 0, 0, 1)',
                            color: 'rgba(19, 0, 0, 1)',
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ✏️ 编辑
                        </motion.button>
                      </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* 分页 */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <motion.button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-solid font-bold shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] sm:hover:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none transition-all text-sm sm:text-base"
                      style={{
                        backgroundColor: 'rgba(255, 248, 232, 1)',
                        borderColor: 'rgba(19, 0, 0, 1)',
                        color: 'rgba(19, 0, 0, 1)',
                      }}
                      whileHover={{ scale: pagination.page > 1 ? 1.05 : 1 }}
                      whileTap={{ scale: pagination.page > 1 ? 0.95 : 1 }}
                    >
                      &lt;
                    </motion.button>
                    
                    <span className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                      {pagination.page} / {pagination.pages}
                    </span>
                    
                    <motion.button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-2 py-1.5 sm:px-3 sm:py-2 border-2 border-solid font-bold shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] sm:hover:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none transition-all text-sm sm:text-base"
                      style={{
                        backgroundColor: 'rgba(255, 248, 232, 1)',
                        borderColor: 'rgba(19, 0, 0, 1)',
                        color: 'rgba(19, 0, 0, 1)',
                      }}
                      whileHover={{ scale: pagination.page < pagination.pages ? 1.05 : 1 }}
                      whileTap={{ scale: pagination.page < pagination.pages ? 0.95 : 1 }}
                    >
                      &gt;
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 登录注册模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* 收藏模态框 */}
      <BookmarkModal
        isOpen={showBookmarkModal}
        url={bookmarkUrl}
        onClose={() => setShowBookmarkModal(false)}
        onSuccess={handleBookmarkSuccess}
      />

      {/* 创建标签模态框 */}
      <CreateTagModal
        isOpen={showCreateTagModal}
        onClose={() => setShowCreateTagModal(false)}
        onSuccess={handleCreateTagSuccess}
      />

      {/* 删除标签模态框 */}
      <DeleteTagModal
        isOpen={showDeleteTagModal}
        tagName={tagToDelete?.name || ''}
        tagId={tagToDelete?.id || 0}
        onClose={() => setShowDeleteTagModal(false)}
        onSuccess={handleDeleteTagSuccess}
      />

      {/* 编辑资源模态框 */}
      {resourceToEdit && (
        <EditResourceModal
          isOpen={showEditResourceModal}
          resource={resourceToEdit}
          onClose={() => setShowEditResourceModal(false)}
          onSuccess={handleEditResourceSuccess}
        />
      )}
    </motion.div>
  );
};

export default Home;
