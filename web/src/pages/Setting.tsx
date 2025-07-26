import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const Setting: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div 
      className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 md:p-8" 
      style={{ backgroundColor: 'rgba(255, 239, 215, 1)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      
      {/* 页面标题 */}
      <motion.div 
        className="mb-6 sm:mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center" 
            style={{ 
              color: 'rgba(19, 0, 0, 1)',
              fontFamily: '"Menlo", "Consolas", "Courier New", "Hannotate SC", "DengXian", monospace',
              textShadow: '2px 2px 0 rgba(255, 111, 46, 0.3) sm:3px 3px 0 rgba(255, 111, 46, 0.3)'
            }}>
          设置
        </h1>
      </motion.div>

      {/* 用户信息卡片 */}
      <motion.div 
        className="w-full max-w-xs sm:max-w-sm md:max-w-md mb-6 sm:mb-8 px-4 sm:px-0"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div 
          className="border-2 border-solid p-3 sm:p-4 md:p-6 shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] md:shadow-[5px_5px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] md:hover:shadow-[7px_7px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all"
          style={{ 
            backgroundColor: 'rgba(255, 248, 232, 1)',
            borderColor: 'rgba(19, 0, 0, 1)'
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: 0.1 }}
          whileHover={{ rotate: 0.3 }}
        >
          <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4" 
              style={{ color: 'rgba(19, 0, 0, 1)' }}>
            用户信息
          </h2>
          
          {user && (
            <motion.div 
              className="space-y-2 sm:space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.div 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-1.5 sm:p-2 rounded hover:bg-[rgba(255,239,215,0.5)] transition-colors gap-1 sm:gap-0"
                whileHover={{ x: 1 }}
              >
                <span className="font-bold text-xs sm:text-sm" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  用户名：
                </span>
                <span className="text-xs sm:text-sm break-all" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  {user.username}
                </span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-1.5 sm:p-2 rounded hover:bg-[rgba(255,239,215,0.5)] transition-colors gap-1 sm:gap-0"
                whileHover={{ x: 1 }}
              >
                <span className="font-bold text-xs sm:text-sm" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  用户ID：
                </span>
                <span className="text-xs sm:text-sm break-all" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  {user.id}
                </span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-1.5 sm:p-2 rounded hover:bg-[rgba(255,239,215,0.5)] transition-colors gap-1 sm:gap-0"
                whileHover={{ x: 1 }}
              >
                <span className="font-bold text-xs sm:text-sm" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  注册时间：
                </span>
                <span className="text-xs sm:text-sm break-all" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  {formatDate(user.created_at)}
                </span>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-1.5 sm:p-2 rounded hover:bg-[rgba(255,239,215,0.5)] transition-colors gap-1 sm:gap-0"
                whileHover={{ x: 1 }}
              >
                <span className="font-bold text-xs sm:text-sm" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  更新时间：
                </span>
                <span className="text-xs sm:text-sm break-all" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  {formatDate(user.updated_at)}
                </span>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* 操作按钮区域 */}
      <motion.div 
        className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-3 sm:space-y-4 px-4 sm:px-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* 以后可以在这里添加更多设置项 */}
        <motion.div
          className="border-2 border-solid p-3 sm:p-4 shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all"
          style={{ 
            backgroundColor: 'rgba(255, 248, 232, 1)',
            borderColor: 'rgba(19, 0, 0, 1)'
          }}
          whileHover={{ rotate: -0.2 }}
        >
          <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base" style={{ color: 'rgba(19, 0, 0, 1)' }}>主题设置</h3>
          <p className="text-xs sm:text-sm opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            当前使用：新拟物风格主题
          </p>
        </motion.div>

        <motion.div
          className="border-2 border-solid p-3 sm:p-4 shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all"
          style={{ 
            backgroundColor: 'rgba(255, 248, 232, 1)',
            borderColor: 'rgba(19, 0, 0, 1)'
          }}
          whileHover={{ rotate: 0.2 }}
        >
          <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base" style={{ color: 'rgba(19, 0, 0, 1)' }}>语言设置</h3>
          <p className="text-xs sm:text-sm opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            当前使用：简体中文
          </p>
        </motion.div>

        {/* 登出按钮 */}
        <motion.button
          onClick={handleLogout}
          className="w-full px-4 py-2 sm:px-6 sm:py-3 border-2 border-solid font-bold shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all text-sm sm:text-base min-h-[44px]"
          style={{
            backgroundColor: 'rgba(255, 111, 46, 1)',
            borderColor: 'rgba(19, 0, 0, 1)',
            color: 'rgba(19, 0, 0, 1)',
            fontFamily: '"Menlo", "Consolas", "Courier New", "Hannotate SC", "DengXian", monospace'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          退出登录
        </motion.button>
      </motion.div>

      {/* 空白区域，保持页面平衡 */}
      <div className="flex-1"></div>
    </motion.div>
  );
};

export default Setting;