import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import IconSvg from '../images/icon.svg';
import ProgressFloatingWindow from './ProgressFloatingWindow';
import BookmarkModal from './BookmarkModal';
import { useProgress } from '../contexts/ProgressContext';
import toast from '../utils/toast';

const Layout: React.FC = () => {
  const location = useLocation();
  const { tasks, removeTask, clearCompleted } = useProgress();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState<{
    url: string;
    previewData: any;
  } | null>(null);

  const handlePreviewComplete = (previewData: any, url: string) => {
    setEditModalData({ url, previewData });
    setShowEditModal(true);
    toast.success('点击完成预览，可以编辑收藏信息');
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditModalData(null);
  };

  const handleEditModalSuccess = () => {
    setShowEditModal(false);
    setEditModalData(null);
    // 这里可以添加刷新页面或其他成功处理逻辑
  };

  return (
    <div className="w-full min-h-screen flex flex-col" 
         style={{ 
           backgroundColor: 'rgba(255, 239, 215, 1)', 
           fontFamily: '"Menlo", "Consolas", "Courier New", "Hannotate SC", "DengXian", monospace',
           lineHeight: 1.4 
         }}>
      <header className="flex justify-between items-center w-full h-16 sm:h-20 px-3 sm:px-6 border-b-2 border-solid flex-shrink-0"
        style={{ borderColor: 'rgba(19, 0, 0, 1)' }}>

        <Link to="/about" className="flex items-center gap-2 sm:gap-4 text-xl sm:text-3xl font-bold hover:opacity-70 transition-opacity"
          style={{ color: 'rgba(19, 0, 0, 1)' }}>
          <div className="bg-[rgba(255,248,232,1)] border-2 border-[rgba(19,0,0,1)] rounded-2xl shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)]">
            <img src={IconSvg} alt="LinkBox Icon" className="w-10 h-10 sm:w-13 sm:h-13" />
          </div>
          <span className="hidden xs:inline">LinkBox</span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-4">
          <Link 
            to="/" 
            className={`px-2 py-1 sm:px-4 sm:py-2 border-2 border-solid font-bold transition-all text-xs sm:text-base ${
              location.pathname === '/' 
                ? 'shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] translate-x-[-1px] translate-y-[-1px] sm:translate-x-[-2px] sm:translate-y-[-2px]' 
                : 'shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] sm:hover:shadow-[5px_5px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]'
            }`}
            style={{
              backgroundColor: location.pathname === '/' ? 'rgba(255, 111, 46, 1)' : 'rgba(255, 248, 232, 1)',
              borderColor: 'rgba(19, 0, 0, 1)',
              color: 'rgba(19, 0, 0, 1)',
            }}
          >
            <span className="hidden sm:inline">首页</span>
            <span className="sm:hidden">🏠</span>
          </Link>
          <Link 
            to="/chat" 
            className={`px-2 py-1 sm:px-4 sm:py-2 border-2 border-solid font-bold transition-all text-xs sm:text-base ${
              location.pathname === '/chat' 
                ? 'shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] translate-x-[-1px] translate-y-[-1px] sm:translate-x-[-2px] sm:translate-y-[-2px]' 
                : 'shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] sm:hover:shadow-[5px_5px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]'
            }`}
            style={{
              backgroundColor: location.pathname === '/chat' ? 'rgba(255, 111, 46, 1)' : 'rgba(255, 248, 232, 1)',
              borderColor: 'rgba(19, 0, 0, 1)',
              color: 'rgba(19, 0, 0, 1)',
            }}
          >
            <span className="hidden sm:inline">AI对话</span>
            <span className="sm:hidden">🤖</span>
          </Link>
          <Link 
            to="/setting" 
            className={`px-2 py-1 sm:px-4 sm:py-2 border-2 border-solid font-bold transition-all text-xs sm:text-base ${
              location.pathname === '/setting' 
                ? 'shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] translate-x-[-1px] translate-y-[-1px] sm:translate-x-[-2px] sm:translate-y-[-2px]' 
                : 'shadow-[2px_2px_0_rgba(19,0,0,1)] sm:shadow-[3px_3px_0_rgba(19,0,0,1)] hover:shadow-[3px_3px_0_rgba(19,0,0,1)] sm:hover:shadow-[5px_5px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px]'
            }`}
            style={{
              backgroundColor: location.pathname === '/setting' ? 'rgba(255, 111, 46, 1)' : 'rgba(255, 248, 232, 1)',
              borderColor: 'rgba(19, 0, 0, 1)',
              color: 'rgba(19, 0, 0, 1)',
            }}
          >
            <span className="hidden sm:inline">设置</span>
            <span className="sm:hidden">⚙️</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      
      {/* 进度悬浮窗 */}
      <ProgressFloatingWindow
        tasks={tasks}
        onTaskRemove={removeTask}
        onClearCompleted={clearCompleted}
        onPreviewComplete={handlePreviewComplete}
      />
      
      {/* 编辑模态框 */}
      {showEditModal && editModalData && (
        <BookmarkModal
          isOpen={showEditModal}
          url={editModalData.url}
          onClose={handleEditModalClose}
          onSuccess={handleEditModalSuccess}
          initialData={editModalData.previewData}
        />
      )}
    </div>
  );
};

export default Layout;