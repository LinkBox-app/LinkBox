import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants, type AnimationGeneratorType } from 'framer-motion';
import { login, register } from '../api/methods/auth.methods';
import type { UserLogin, UserRegister } from '../api/types/auth.types';
import { useI18n } from '../contexts/I18nContext';
import { AUTH_TOKEN_KEY, LOGIN_FLAG_KEY } from '../storage-key.constant';
import toast from '../utils/toast';
import LoadingDots from './LoadingDots';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useI18n();
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
      newErrors.username = t('auth.usernameEmpty');
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      newErrors.username = t('auth.usernameLength');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('auth.passwordEmpty');
    } else if (formData.password.length < 6 || formData.password.length > 100) {
      newErrors.password = t('auth.passwordLength');
    }

    if (mode === 'register') {
      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = t('auth.confirmPasswordEmpty');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('auth.confirmPasswordMismatch');
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

      toast.success(mode === 'login' ? t('auth.loginSuccess') : t('auth.registerSuccess'));
      
      // 重置表单
      setFormData({ username: '', password: '', confirmPassword: '' });
      setErrors({});
      
      // 调用成功回调
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`${mode === 'login' ? '登录' : '注册'}失败:`, error);
      toast.error(error.message || (mode === 'login' ? t('auth.loginError') : t('auth.registerError')));
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
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h2>
          <p 
            className="text-xs sm:text-sm opacity-70"
            style={{ color: 'rgba(19, 0, 0, 1)' }}
          >
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
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
              {t('auth.usernameLabel')}
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
              placeholder={mode === 'login' ? t('auth.usernameLoginPlaceholder') : t('auth.usernameRegisterPlaceholder')}
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
              {t('auth.passwordLabel')}
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
              placeholder={mode === 'login' ? t('auth.passwordLoginPlaceholder') : t('auth.passwordRegisterPlaceholder')}
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
                {t('auth.confirmPasswordLabel')}
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
                placeholder={t('auth.confirmPasswordPlaceholder')}
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
              <LoadingDots text={mode === 'login' ? t('auth.loggingIn') : t('auth.registering')} />
            ) : (
              mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')
            )}
          </motion.button>
        </form>

        {/* 模式切换 */}
        <div className="mt-4 sm:mt-6 text-center">
          <p 
            className="text-xs sm:text-sm mb-2"
            style={{ color: 'rgba(19, 0, 0, 1)' }}
          >
            {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
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
            {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
          </motion.button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
