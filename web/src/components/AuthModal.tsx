import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants, type AnimationGeneratorType } from 'framer-motion';
import { login, register } from '../api/methods/auth.methods';
import type { UserLogin, UserRegister } from '../api/types/auth.types';
import { AUTH_TOKEN_KEY, LOGIN_FLAG_KEY } from '../storage-key.constant';
import toast from '../utils/toast';
import LoadingDots from './LoadingDots';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 模态框动画变体
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = '用户名长度必须在3-50个字符之间';
    }

    if (!formData.password.trim()) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6 || formData.password.length > 100) {
      newErrors.password = '密码长度必须在6-100个字符之间';
    }

    if (mode === 'register') {
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = '请确认密码';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      let response;
      
      if (mode === 'login') {
        const loginData: UserLogin = {
          username: formData.username,
          password: formData.password,
        };
        response = await login(loginData);
      } else {
        const registerData: UserRegister = {
          username: formData.username,
          password: formData.password,
        };
        response = await register(registerData);
      }

      // 存储token和登录状态
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      localStorage.setItem(LOGIN_FLAG_KEY, 'true');

      toast.success(mode === 'login' ? '登录成功！' : '注册成功！');
      
      // 重置表单
      setFormData({ username: '', password: '', confirmPassword: '' });
      setErrors({});
      
      // 调用成功回调
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`${mode === 'login' ? '登录' : '注册'}失败:`, error);
      toast.error(error.message || `${mode === 'login' ? '登录' : '注册'}失败，请重试`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleModeSwitch = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({ username: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm dot-pattern"
          style={{ backgroundColor: 'rgba(255, 239, 215, 0.95)' }}
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
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-lg sm:text-xl font-bold transition-all p-1 sm:p-0"
          style={{ color: 'rgba(19, 0, 0, 1)' }}
          disabled={isLoading}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </motion.button>

        {/* 标题 */}
        <div className="mb-4 sm:mb-6">
          <h2 
            className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2"
            style={{ color: 'rgba(19, 0, 0, 1)' }}
          >
            {mode === 'login' ? '登录' : '注册'}
          </h2>
          <p 
            className="text-xs sm:text-sm opacity-70"
            style={{ color: 'rgba(19, 0, 0, 1)' }}
          >
            {mode === 'login' ? '欢迎回来！请输入您的账号信息' : '创建新账号，开始使用LinkBox'}
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* 用户名 */}
          <div>
            <label 
              className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
              style={{ color: 'rgba(19, 0, 0, 1)' }}
            >
              用户名 *
            </label>
            <motion.input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none transition-all text-sm sm:text-base"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 1)',
                borderColor: errors.username ? 'rgba(239, 68, 68, 1)' : 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
                fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
                boxShadow: errors.username ? '3px 3px 0px rgba(239, 68, 68, 0.3)' : '3px 3px 0px rgba(19, 0, 0, 0.2)'
              }}
              placeholder={mode === 'login' ? '请输入用户名' : '3-50个字符'}
              disabled={isLoading}
              maxLength={50}
              whileFocus={{ 
                boxShadow: '4px 4px 0px rgba(255, 111, 46, 0.3)',
                x: -1,
                y: -1
              }}
            />
            {errors.username && (
              <p className="mt-1 text-sm" style={{ color: 'rgba(239, 68, 68, 1)' }}>
                {errors.username}
              </p>
            )}
          </div>

          {/* 密码 */}
          <div>
            <label 
              className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
              style={{ color: 'rgba(19, 0, 0, 1)' }}
            >
              密码 *
            </label>
            <motion.input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none transition-all text-sm sm:text-base"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 1)',
                borderColor: errors.password ? 'rgba(239, 68, 68, 1)' : 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
                fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
                boxShadow: errors.password ? '3px 3px 0px rgba(239, 68, 68, 0.3)' : '3px 3px 0px rgba(19, 0, 0, 0.2)'
              }}
              placeholder={mode === 'login' ? '请输入密码' : '6-100个字符'}
              disabled={isLoading}
              maxLength={100}
              whileFocus={{ 
                boxShadow: '4px 4px 0px rgba(255, 111, 46, 0.3)',
                x: -1,
                y: -1
              }}
            />
            {errors.password && (
              <p className="mt-1 text-sm" style={{ color: 'rgba(239, 68, 68, 1)' }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* 确认密码（仅注册时显示） */}
          {mode === 'register' && (
            <div>
              <label 
                className="block text-xs sm:text-sm font-bold mb-1 sm:mb-2"
                style={{ color: 'rgba(19, 0, 0, 1)' }}
              >
                确认密码 *
              </label>
              <motion.input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none transition-all text-sm sm:text-base"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: errors.confirmPassword ? 'rgba(239, 68, 68, 1)' : 'rgba(19, 0, 0, 1)',
                  color: 'rgba(19, 0, 0, 1)',
                  fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
                  boxShadow: errors.confirmPassword ? '3px 3px 0px rgba(239, 68, 68, 0.3)' : '3px 3px 0px rgba(19, 0, 0, 0.2)'
                }}
                placeholder="请再次输入密码"
                disabled={isLoading}
                maxLength={100}
                whileFocus={{ 
                  boxShadow: '4px 4px 0px rgba(255, 111, 46, 0.3)',
                  x: -1,
                  y: -1
                }}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm" style={{ color: 'rgba(239, 68, 68, 1)' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* 提交按钮 */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full p-2 sm:p-3 border-2 border-solid font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base min-h-[44px] flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(255, 111, 46, 1)',
              borderColor: 'rgba(19, 0, 0, 1)',
              color: 'rgba(19, 0, 0, 1)',
              fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
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
            {isLoading ? (
              <LoadingDots text={mode === 'login' ? '登录中' : '注册中'} />
            ) : (
              mode === 'login' ? '登录' : '注册'
            )}
          </motion.button>
        </form>

        {/* 模式切换 */}
        <div className="mt-4 sm:mt-6 text-center">
          <p 
            className="text-xs sm:text-sm mb-2"
            style={{ color: 'rgba(19, 0, 0, 1)' }}
          >
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
          </p>
          <motion.button
            onClick={handleModeSwitch}
            disabled={isLoading}
            className="text-xs sm:text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-block px-3 sm:px-4 py-2 border-2 border-solid min-h-[40px] flex items-center justify-center mx-auto"
            style={{ 
              color: 'rgba(19, 0, 0, 1)',
              backgroundColor: 'rgba(255, 239, 215, 1)',
              borderColor: 'rgba(19, 0, 0, 1)',
              fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
              boxShadow: '3px 3px 0px rgba(19, 0, 0, 1)'
            }}
            whileHover={{ 
              x: -1,
              y: -1,
              boxShadow: '4px 4px 0px rgba(19, 0, 0, 1)'
            }}
            whileTap={{ 
              x: 1,
              y: 1,
              boxShadow: '1px 1px 0px rgba(19, 0, 0, 1)'
            }}
          >
            {mode === 'login' ? '立即注册 →' : '← 返回登录'}
          </motion.button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;