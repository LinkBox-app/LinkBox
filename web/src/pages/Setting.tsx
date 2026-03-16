import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  getAISettings,
  testAISettings,
  updateAISettings,
} from '../api/methods/settings.methods';
import type { AISettings } from '../api/types/settings.types';
import { useAuth } from '../hooks/useAuth';
import toast from '../utils/toast';

const Setting: React.FC = () => {
  const { user } = useAuth();
  const [aiSettings, setAISettings] = useState<AISettings>({
    ai_base_url: '',
    ai_model: '',
    ai_api_key: '',
  });
  const [isLoadingAISettings, setIsLoadingAISettings] = useState(true);
  const [isSavingAISettings, setIsSavingAISettings] = useState(false);
  const [isTestingAISettings, setIsTestingAISettings] = useState(false);
  const [showAPIKey, setShowAPIKey] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    let cancelled = false;

    const loadAISettings = async () => {
      try {
        setIsLoadingAISettings(true);
        const response = await getAISettings();
        if (cancelled) {
          return;
        }

        setAISettings({
          ai_base_url: response.ai_base_url,
          ai_model: response.ai_model,
          ai_api_key: response.ai_api_key,
        });
        setLastUpdatedAt(response.updated_at);
      } catch (error: any) {
        if (!cancelled) {
          toast.error(error.message || '加载 AI 配置失败');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAISettings(false);
        }
      }
    };

    void loadAISettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAISettingsChange = (
    field: keyof AISettings,
    value: string
  ) => {
    setAISettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const normalizeAISettings = (): AISettings => ({
    ai_base_url: aiSettings.ai_base_url.trim(),
    ai_model: aiSettings.ai_model.trim(),
    ai_api_key: aiSettings.ai_api_key.trim(),
  });

  const handleSaveAISettings = async () => {
    const normalizedSettings = normalizeAISettings();

    if (!normalizedSettings.ai_base_url || !normalizedSettings.ai_model) {
      toast.error('请先填写完整的 AI 地址和模型名称');
      return;
    }

    try {
      setIsSavingAISettings(true);
      const response = await updateAISettings(normalizedSettings);
      setAISettings({
        ai_base_url: response.ai_base_url,
        ai_model: response.ai_model,
        ai_api_key: response.ai_api_key,
      });
      setLastUpdatedAt(response.updated_at);
      toast.success('AI 配置已保存到本地');
    } catch (error: any) {
      toast.error(error.message || '保存 AI 配置失败');
    } finally {
      setIsSavingAISettings(false);
    }
  };

  const handleTestAISettings = async () => {
    const normalizedSettings = normalizeAISettings();

    if (!normalizedSettings.ai_base_url || !normalizedSettings.ai_model) {
      toast.error('请先填写完整的 AI 地址和模型名称');
      return;
    }

    if (!normalizedSettings.ai_api_key) {
      toast.error('请先填写 AI API Key');
      return;
    }

    try {
      setIsTestingAISettings(true);
      const response = await testAISettings(normalizedSettings);
      toast.success(response.message, 5000);
    } catch (error: any) {
      toast.error(error.message || '测试 AI 配置失败', 5000);
    } finally {
      setIsTestingAISettings(false);
    }
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
        {/* <motion.div 
          className="border-2 border-solid p-3 sm:p-4 md:p-6 shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] md:shadow-[5px_5px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] md:hover:shadow-[7px_7px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all"
          style={{ 
            backgroundColor: 'rgba(255, 248, 232, 1)',
            borderColor: 'rgba(19, 0, 0, 1)'
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: 0.1 }}
          whileHover={{ rotate: 0.3 }}
        > */}
          {/* <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4" 
              style={{ color: 'rgba(19, 0, 0, 1)' }}>
            本地资料
          </h2> */}
          
          {/* {user && (
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
                  当前用户：
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
                  创建时间：
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
          )} */}
        {/* </motion.div> */}
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

        {/* <motion.div
          className="border-2 border-solid p-3 sm:p-4 shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all"
          style={{
            backgroundColor: 'rgba(255, 248, 232, 1)',
            borderColor: 'rgba(19, 0, 0, 1)'
          }}
          whileHover={{ rotate: -0.1 }}
        >
          <h3 className="font-bold mb-1 sm:mb-2 text-sm sm:text-base" style={{ color: 'rgba(19, 0, 0, 1)' }}>个人模式</h3>
          <p className="text-xs sm:text-sm opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            当前版本默认使用本地单用户模式，无需登录即可直接收藏和对话。
          </p>
        </motion.div> */}

        <motion.div
          className="border-2 border-solid p-3 sm:p-4 md:p-5 shadow-[3px_3px_0_rgba(19,0,0,1)] sm:shadow-[4px_4px_0_rgba(19,0,0,1)] hover:shadow-[4px_4px_0_rgba(19,0,0,1)] sm:hover:shadow-[6px_6px_0_rgba(19,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] sm:hover:translate-x-[-2px] sm:hover:translate-y-[-2px] transition-all"
          style={{
            backgroundColor: 'rgba(255, 248, 232, 1)',
            borderColor: 'rgba(19, 0, 0, 1)'
          }}
          whileHover={{ rotate: 0.15 }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                AI 配置
              </h3>
              <p className="text-xs sm:text-sm opacity-70 mt-1" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                在这里配置个人使用的 AI 服务，本地保存，保存后立即生效。
              </p>
            </div>
            {lastUpdatedAt && (
              <span className="text-[11px] sm:text-xs opacity-60 text-right" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                更新于 {formatDate(lastUpdatedAt)}
              </span>
            )}
          </div>

          {isLoadingAISettings ? (
            <p className="text-xs sm:text-sm opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              正在加载 AI 配置...
            </p>
          ) : (
            <div className="space-y-3">
              <label className="block">
                <span className="block text-xs sm:text-sm font-bold mb-1" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  API Base URL
                </span>
                <input
                  type="url"
                  value={aiSettings.ai_base_url}
                  onChange={(e) => handleAISettingsChange('ai_base_url', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none text-xs sm:text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 252, 245, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                  }}
                />
              </label>

              <label className="block">
                <span className="block text-xs sm:text-sm font-bold mb-1" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  模型名称
                </span>
                <input
                  type="text"
                  value={aiSettings.ai_model}
                  onChange={(e) => handleAISettingsChange('ai_model', e.target.value)}
                  placeholder="gpt-4.1-mini"
                  className="w-full p-2 sm:p-3 border-2 border-solid focus:outline-none text-xs sm:text-sm"
                  style={{
                    backgroundColor: 'rgba(255, 252, 245, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                  }}
                />
              </label>

              <label className="block">
                <span className="block text-xs sm:text-sm font-bold mb-1" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                  API Key
                </span>
                <div className="flex gap-2">
                  <input
                    type={showAPIKey ? 'text' : 'password'}
                    value={aiSettings.ai_api_key}
                    onChange={(e) => handleAISettingsChange('ai_api_key', e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 p-2 sm:p-3 border-2 border-solid focus:outline-none text-xs sm:text-sm"
                    style={{
                      backgroundColor: 'rgba(255, 252, 245, 1)',
                      borderColor: 'rgba(19, 0, 0, 1)',
                      color: 'rgba(19, 0, 0, 1)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAPIKey((prev) => !prev)}
                    className="px-3 py-2 border-2 border-solid text-xs sm:text-sm font-bold"
                    style={{
                      backgroundColor: 'rgba(255, 239, 215, 1)',
                      borderColor: 'rgba(19, 0, 0, 1)',
                      color: 'rgba(19, 0, 0, 1)',
                    }}
                  >
                    {showAPIKey ? '隐藏' : '显示'}
                  </button>
                </div>
              </label>

              <p className="text-[11px] sm:text-xs opacity-70" style={{ color: 'rgba(19, 0, 0, 1)' }}>
                这些配置会保存在本地数据库里，仅当前设备生效。开发环境下如果这里没填，会回退到 `.env` 中的默认值。
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <motion.button
                  type="button"
                  onClick={handleTestAISettings}
                  disabled={isTestingAISettings || isSavingAISettings}
                  className="flex-1 px-4 py-2 border-2 border-solid font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(255, 248, 232, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                  }}
                  whileHover={{ scale: isTestingAISettings || isSavingAISettings ? 1 : 1.02 }}
                  whileTap={{ scale: isTestingAISettings || isSavingAISettings ? 1 : 0.98 }}
                >
                  {isTestingAISettings ? '测试中...' : '测试连接'}
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleSaveAISettings}
                  disabled={isSavingAISettings || isTestingAISettings}
                  className="flex-1 px-4 py-2 border-2 border-solid font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgba(255, 111, 46, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                  }}
                  whileHover={{ scale: isSavingAISettings || isTestingAISettings ? 1 : 1.02 }}
                  whileTap={{ scale: isSavingAISettings || isTestingAISettings ? 1 : 0.98 }}
                >
                  {isSavingAISettings ? '保存中...' : '保存配置'}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* 空白区域，保持页面平衡 */}
      <div className="flex-1"></div>
    </motion.div>
  );
};

export default Setting;
