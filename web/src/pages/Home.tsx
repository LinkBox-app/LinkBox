import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import type { TagResponse } from '../api/methods/tag.methods';
import type { ResourceResponse } from '../api/types/resource.types';
import BookmarkModal from '../components/BookmarkModal';
import CreateTagModal from '../components/CreateTagModal';
import DeleteTagModal from '../components/DeleteTagModal';
import DeleteResourceModal from '../components/DeleteResourceModal';
import EditResourceModal from '../components/EditResourceModal';
import LoadingDots from '../components/LoadingDots';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../hooks/useAuth';
import { useResources } from '../contexts/ResourceContext';
import { openExternal } from '../utils/openExternal';
import toast from '../utils/toast';

type TagChipProps = {
  layoutId: string;
  label: string;
  active: boolean;
  onClick: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
  deleteTitle?: string;
};

const TAG_CHIP_LAYOUT_TRANSITION = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
};

const TagChip: React.FC<TagChipProps> = ({
  layoutId,
  label,
  active,
  onClick,
  showDelete = false,
  onDelete,
  deleteTitle,
}) => (
  <motion.div
    layout="position"
    layoutId={layoutId}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{
      layout: TAG_CHIP_LAYOUT_TRANSITION,
      opacity: { duration: 0.16 },
      y: TAG_CHIP_LAYOUT_TRANSITION,
    }}
    whileHover={{ y: -1 }}
    whileTap={{ scale: 0.98 }}
    className={`relative flex items-center gap-2 border-2 border-solid font-bold transition-[background-color,color,box-shadow] duration-200 ${
      active
        ? 'shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)]'
        : 'shadow-[2px_2px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] sm:hover:shadow-[4px_4px_0_rgba(19,0,0,1)]'
    }`}
    style={{
      backgroundColor: active ? 'rgba(255, 111, 46, 1)' : 'rgba(255, 248, 232, 1)',
      borderColor: 'rgba(19, 0, 0, 1)',
      color: 'rgba(19, 0, 0, 1)',
    }}
  >
    <button
      type="button"
      onClick={onClick}
      className="max-w-[10rem] sm:max-w-[14rem] truncate px-3 py-1.5 sm:px-4 sm:py-2 text-left text-sm sm:text-base"
      title={label}
    >
      {label}
    </button>

    {showDelete && onDelete && (
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="mr-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-solid text-xs font-bold transition-all hover:scale-105"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 1)',
          borderColor: 'rgba(19, 0, 0, 1)',
          color: 'rgba(255, 255, 255, 1)',
        }}
        title={deleteTitle}
        aria-label={deleteTitle}
      >
        ×
      </motion.button>
    )}
  </motion.div>
);

const Home: React.FC = () => {
  const { t, formatDate } = useI18n();
  const { isLoading: authLoading } = useAuth();
  const {
    currentPage,
    fetchList,
    tags,
    resources,
    pagination,
    selectedTag,
    isLoadingTags,
    isLoadingResources,
    selectTag,
    goToPage,
  } = useResources();
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [showDeleteTagModal, setShowDeleteTagModal] = useState(false);
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [showDeleteResourceModal, setShowDeleteResourceModal] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<{ id: number; name: string } | null>(null);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceResponse | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<ResourceResponse | null>(null);
  
  // 收藏链接相关状态
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // 检测屏幕大小
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleBookmarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookmarkUrl.trim()) {
      toast.error(t('home.invalidLink'));
      return;
    }
    
    try {
      new URL(bookmarkUrl);
      setShowBookmarkModal(true);
    } catch {
      toast.error(t('home.invalidUrl'));
    }
  };

  const handleBookmarkSuccess = (createdResource?: ResourceResponse) => {
    if (createdResource) {
      setBookmarkUrl('');
    }
    void fetchList(null, 1);
  };

  const handleCreateTagSuccess = () => {
    setShowCreateTagModal(false);
    void fetchList(selectedTag, currentPage);
  };

  const handleDeleteTag = (tagId: number, tagName: string) => {
    setTagToDelete({ id: tagId, name: tagName });
    setShowDeleteTagModal(true);
  };

  const handleDeleteTagSuccess = () => {
    setShowDeleteTagModal(false);
    setTagToDelete(null);
    setIsManagingTags(false);
    void fetchList(selectedTag, currentPage);
  };

  const handlePageChange = (newPage: number) => {
    goToPage(newPage);
  };

  const handleEditResource = (resource: ResourceResponse) => {
    setResourceToEdit(resource);
    setShowEditResourceModal(true);
  };

  const handleDeleteResource = (resource: ResourceResponse) => {
    setResourceToDelete(resource);
    setShowDeleteResourceModal(true);
  };

  const handleEditResourceSuccess = () => {
    setShowEditResourceModal(false);
    setResourceToEdit(null);
    void fetchList(selectedTag, currentPage);
  };

  const handleDeleteResourceSuccess = () => {
    setShowDeleteResourceModal(false);
    setResourceToDelete(null);
    void fetchList(selectedTag, currentPage);
  };

  const primaryTagLimit = isMobile ? 5 : 8;
  const visibleTagIds = new Set<number>();
  const selectedTagItem = selectedTag
    ? tags.find((tag) => tag.name === selectedTag) ?? null
    : null;

  if (selectedTagItem) {
    visibleTagIds.add(selectedTagItem.id);
  }

  tags.forEach((tag) => {
    if (visibleTagIds.size < primaryTagLimit) {
      visibleTagIds.add(tag.id);
    }
  });

  const primaryTags = tags.filter((tag) => visibleTagIds.has(tag.id));
  const overflowTags = tags.filter((tag) => !visibleTagIds.has(tag.id));

  useEffect(() => {
    if (overflowTags.length === 0 && showAllTags) {
      setShowAllTags(false);
    }
  }, [overflowTags.length, showAllTags]);

  const renderTagChip = (tag: TagResponse) => (
    <TagChip
      key={tag.id}
      layoutId={`tag-chip-${tag.id}`}
      label={`#${tag.name}`}
      active={selectedTag === tag.name}
      onClick={() => selectTag(tag.name)}
      showDelete={isManagingTags}
      onDelete={() => handleDeleteTag(tag.id, tag.name)}
      deleteTitle={t('home.deleteTagTitle', { name: tag.name })}
    />
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dot-pattern"
        style={{ backgroundColor: 'rgba(255, 239, 215, 1)' }}>
        <div className="text-center">
          <LoadingDots 
            text={t('home.initializing')}
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
              {t('home.welcome')}
            </p>
          </div>
          
          <form onSubmit={handleBookmarkSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="url"
              value={bookmarkUrl}
              onChange={(e) => setBookmarkUrl(e.target.value)}
              placeholder={t('home.bookmarkPlaceholder')}
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
              {t('home.bookmarkAction')}
            </motion.button>
          </form>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* 标签栏 */}
        <div className="mb-4 sm:mb-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
            <h2 className="text-base sm:text-lg font-bold" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              {t('home.tagSectionTitle')}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {tags.length > 0 && (
                <motion.button
                  onClick={() => setIsManagingTags((prev) => !prev)}
                  className="px-2 py-1 sm:px-3 sm:py-1 border-2 border-solid font-bold text-xs sm:text-sm shadow-[2px_2px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  style={{
                    backgroundColor: isManagingTags ? 'rgba(19, 0, 0, 1)' : 'rgba(255, 248, 232, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: isManagingTags ? 'rgba(255, 248, 232, 1)' : 'rgba(19, 0, 0, 1)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isManagingTags ? t('home.doneManagingTags') : t('home.manageTags')}
                </motion.button>
              )}
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
                {t('home.createTag')}
              </motion.button>
            </div>
          </div>
          
          {isLoadingTags ? (
            <div className="flex items-center">
              <LoadingDots text={t('home.loadingTags')} className="terminal-text" />
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
              <p className="text-center">{t('home.emptyTags')}</p>
            </div>
          ) : (
            <div
              className="flex flex-col gap-3 border-2 border-solid p-3 sm:gap-4 sm:p-4"
              style={{
                backgroundColor: 'rgba(255, 248, 232, 0.72)',
                borderColor: 'rgba(19, 0, 0, 1)',
              }}
            >
              <LayoutGroup id="home-tag-layout">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    <TagChip
                      key="all"
                      layoutId="tag-chip-all"
                      label={t('home.allResources')}
                      active={selectedTag === null}
                      onClick={() => selectTag(null)}
                    />

                    {primaryTags.map(renderTagChip)}
                  </AnimatePresence>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                    {t('home.showingTags', {
                      visible: primaryTags.length,
                      total: tags.length,
                    })}
                  </span>

                  {overflowTags.length > 0 && (
                    <motion.button
                      onClick={() => setShowAllTags((prev) => !prev)}
                      className="border-2 border-dashed px-2 py-1 font-bold shadow-[2px_2px_0_rgba(19,0,0,0.25)] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_rgba(19,0,0,0.4)]"
                      style={{
                        backgroundColor: showAllTags ? 'rgba(255, 111, 46, 0.18)' : 'rgba(255, 248, 232, 0.8)',
                        borderColor: 'rgba(19, 0, 0, 0.55)',
                        color: 'rgba(19, 0, 0, 1)',
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {showAllTags
                        ? t('home.collapseTags')
                        : t('home.moreTags', { count: overflowTags.length })}
                    </motion.button>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {showAllTags && overflowTags.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="max-h-48 overflow-y-auto border-2 border-dashed p-3 sm:max-h-56"
                        style={{
                          backgroundColor: 'rgba(255, 248, 232, 0.85)',
                          borderColor: 'rgba(19, 0, 0, 0.45)',
                        }}
                      >
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          <AnimatePresence initial={false} mode="popLayout">
                            {overflowTags.map(renderTagChip)}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </LayoutGroup>
            </div>
          )}
        </div>

        {/* 资源列表 */}
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                {selectedTag
                  ? t('home.resourceSectionTitle', { tag: selectedTag })
                  : t('home.allResources')}
              </h3>
              <span className="text-xs sm:text-sm opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                {t('home.totalResources', { count: pagination.total })}
              </span>
            </div>

            {isLoadingResources ? (
              <div className="flex items-center justify-center py-8">
                <LoadingDots text={t('home.loadingResources')} className="terminal-text" />
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
                <p>{selectedTag ? t('home.emptyResourcesInTag') : t('home.emptyResources')}</p>
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
                        onClick={() => {
                          void openExternal(resource.url);
                        }}
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void openExternal(resource.url);
                          }}
                        >
                          {resource.url.length > (isMobile ? 30 : 50) 
                            ? `${resource.url.substring(0, isMobile ? 30 : 50)}...` 
                            : resource.url}
                        </a>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResource(resource);
                            }}
                            className="px-2 py-1 text-xs border border-solid font-bold shadow-[2px_2px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 1)',
                              borderColor: 'rgba(19, 0, 0, 1)',
                              color: 'rgba(255, 255, 255, 1)',
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {t('home.deleteResource')}
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditResource(resource);
                            }}
                            className="px-2 py-1 text-xs border border-solid font-bold shadow-[2px_2px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                            style={{
                              backgroundColor: 'rgba(255, 111, 46, 1)',
                              borderColor: 'rgba(19, 0, 0, 1)',
                              color: 'rgba(19, 0, 0, 1)',
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {t('home.editResource')}
                          </motion.button>
                        </div>
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
                      {t('home.pageIndicator', {
                        page: pagination.page,
                        pages: pagination.pages,
                      })}
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
      </div>

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
        onClose={() => {
          setShowDeleteTagModal(false);
          setTagToDelete(null);
        }}
        onSuccess={handleDeleteTagSuccess}
      />

      {/* 编辑资源模态框 */}
      {resourceToEdit && (
        <EditResourceModal
          isOpen={showEditResourceModal}
          resource={resourceToEdit}
          onClose={() => {
            setShowEditResourceModal(false);
            setResourceToEdit(null);
          }}
          onSuccess={handleEditResourceSuccess}
        />
      )}

      <DeleteResourceModal
        isOpen={showDeleteResourceModal}
        resource={resourceToDelete}
        onClose={() => {
          setShowDeleteResourceModal(false);
          setResourceToDelete(null);
        }}
        onSuccess={handleDeleteResourceSuccess}
      />
    </motion.div>
  );
};

export default Home;
