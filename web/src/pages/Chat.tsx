import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import LoadingDots from '../components/LoadingDots';
import ResourceCard, { type Resource } from '../components/ResourceCard';
import ToolCallDisplay from '../components/ToolCallDisplay';
import { useI18n } from '../contexts/I18nContext';
import { useAgentStream, type ToolCallInfo, type ToolProgress } from '../hooks/useAgentStream';
import { useAuth } from '../hooks/useAuth';
import toast from '../utils/toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  progressMessages?: string[]; // 进度消息列表
  resources?: Resource[]; // 资源列表
  toolCalls?: { [key: string]: ToolCallInfo }; // 工具调用信息
  toolProgress?: { [key: string]: ToolProgress }; // 工具进度信息
  isThinking?: boolean; // 是否正在思考
}

// sessionStorage key
const getChatMessagesKey = (userId?: number) => 
  `linkbox_chat_messages_${userId || 'local'}`;

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { locale, t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const {
    isStreaming: isAgentStreaming,
    currentThinking,
    toolCalls,
    toolProgress,
    finalResponse,
    error: agentError,
    resources: agentResources,  // 新增：获取资源数据
    sendMessage: sendAgentMessage,
    cancelStream: cancelAgentStream,
  } = useAgentStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 页面加载时从sessionStorage恢复历史消息
  useEffect(() => {
    const chatKey = getChatMessagesKey(user?.id);
    const savedMessages = sessionStorage.getItem(chatKey);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('恢复聊天历史失败:', error);
        // 清除损坏的数据
        sessionStorage.removeItem(chatKey);
      }
    }
  }, [user?.id]); // 依赖用户ID，切换时重新加载消息

  // 消息变化时保存到sessionStorage
  useEffect(() => {
    if (messages.length > 0 && user?.id) {
      try {
        const chatKey = getChatMessagesKey(user.id);
        sessionStorage.setItem(chatKey, JSON.stringify(messages));
      } catch (error) {
        console.error('保存聊天历史失败:', error);
      }
    }
  }, [messages, user?.id]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentStreaming, toolProgress, currentThinking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAgentStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    // 添加用户消息
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // 立即创建一个空的AI消息
    const aiMessageId = `assistant-${Date.now()}`;
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '', // 初始为空
      timestamp: new Date(),
      progressMessages: [],
      resources: [],
      toolCalls: {},
      toolProgress: {},
      isThinking: true, // 显示思考状态
    };
    
    setMessages(prev => [...prev, aiMessage]);

    // Agent 模式
    try {
      // 构建对话历史
      const chatMessages: ChatMessage[] = [
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage.content,
        }
      ];

      await sendAgentMessage(chatMessages);
    } catch (error: any) {
      console.error('Agent对话失败:', error);
      toast.error(error.message || t('chat.sendError'));
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: t('chat.genericFailure'), isThinking: false }
            : msg
        )
      );
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 监听Agent流的状态变化
  useEffect(() => {
    if (!isAgentStreaming) return;

    // 获取最后一条AI消息
    const lastAiMessage = messages.filter(msg => msg.role === 'assistant').pop();
    if (!lastAiMessage || !lastAiMessage.isThinking) return;

    // 更新思考状态
    if (currentThinking !== undefined && currentThinking !== lastAiMessage.content) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === lastAiMessage.id 
            ? { ...msg, content: currentThinking }
            : msg
        )
      );
    }

    // 更新工具调用信息
    if (Object.keys(toolCalls).length > 0) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === lastAiMessage.id 
            ? { ...msg, toolCalls: toolCalls }
            : msg
        )
      );
    }

    // 更新工具进度信息
    if (Object.keys(toolProgress).length > 0) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === lastAiMessage.id 
            ? { ...msg, toolProgress: toolProgress }
            : msg
        )
      );
    }

    // 更新最终响应
    if (finalResponse) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === lastAiMessage.id 
            ? { ...msg, content: finalResponse, isThinking: false }
            : msg
        )
      );
    }

    // 更新资源数据
    if (agentResources && agentResources.length > 0) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === lastAiMessage.id 
            ? { ...msg, resources: agentResources }
            : msg
        )
      );
    }

    // 处理错误
    if (agentError) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === lastAiMessage.id 
            ? { ...msg, content: agentError, isThinking: false }
            : msg
        )
      );
    }
  }, [currentThinking, toolCalls, toolProgress, finalResponse, isAgentStreaming, agentError, agentResources]); // 移除 messages 依赖


  const clearChat = () => {
    if (isAgentStreaming) {
      cancelAgentStream();
    }
    setMessages([]);
    // 清除sessionStorage中的历史消息
    if (user?.id) {
      const chatKey = getChatMessagesKey(user.id);
      sessionStorage.removeItem(chatKey);
    }
  };

  return (
    <motion.div 
      className="min-h-screen dot-pattern flex flex-col" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        backgroundColor: 'rgba(255, 239, 215, 1)',
        fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace'
      }}>
      
      {/* 顶部标题栏 */}
      <div className="p-3 sm:p-4 md:p-6 border-b-2 border-solid"
        style={{ borderColor: 'rgba(19, 0, 0, 1)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 truncate" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              {t('chat.title')}
            </h1>
            <p className="text-xs sm:text-sm opacity-70 truncate" style={{ color: 'rgba(19, 0, 0, 1)' }}>
              {t('chat.subtitle')}
            </p>
          </div>
          
          <div className="flex gap-1 sm:gap-2 items-center flex-shrink-0">
            {messages.length > 0 && (
              <>
                {isAgentStreaming && (
                  <motion.button
                    onClick={cancelAgentStream}
                    className="px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 border-2 border-solid font-bold transition-all text-xs sm:text-sm"
                    whileHover={{ 
                      scale: 1.05,
                      rotate: 0.5,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: 'rgba(255, 111, 46, 1)',
                      borderColor: 'rgba(19, 0, 0, 1)',
                      color: 'rgba(19, 0, 0, 1)',
                      boxShadow: '2px 2px 0 rgba(19, 0, 0, 1)',
                    }}
                  >
                    <span className="hidden sm:inline">{t('chat.cancel')}</span>
                    <span className="sm:hidden">×</span>
                  </motion.button>
                )}
                <motion.button
                  onClick={clearChat}
                  className="px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 border-2 border-solid font-bold transition-all text-xs sm:text-sm"
                  whileHover={{ 
                    scale: 1.05,
                    rotate: -0.5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: 'rgba(255, 248, 232, 1)',
                    borderColor: 'rgba(19, 0, 0, 1)',
                    color: 'rgba(19, 0, 0, 1)',
                    boxShadow: '2px 2px 0 rgba(19, 0, 0, 1)',
                  }}
                >
                  <span className="hidden sm:inline">{t('chat.clearChat')}</span>
                  <span className="sm:hidden">🗑</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-4 md:p-6 flex flex-col scrollbar-hide">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 md:mb-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4">
              <div 
                className="text-center p-4 sm:p-6 md:p-8 border-2 border-solid transform rotate-[-0.2deg] max-w-sm sm:max-w-md mx-auto w-full"
                style={{
                  backgroundColor: 'rgba(255, 248, 232, 1)',
                  borderColor: 'rgba(19, 0, 0, 1)',
                  color: 'rgba(19, 0, 0, 1)',
                }}
                >
                <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4">🤖</div>
                <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{t('chat.emptyTitle')}</h2>
                <p className="text-xs sm:text-sm opacity-70">
                  {t('chat.emptyDescription')}
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {messages.map((message, index) => {
                const isLastAIMessage = message.role === 'assistant' && 
                  index === messages.length - 1;
                
                return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2 sm:gap-3 md:gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* AI头像 */}
                  {message.role === 'assistant' && (
                    <motion.div 
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-solid flex items-center justify-center font-bold flex-shrink-0 text-xs sm:text-sm md:text-base"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: -3,
                        transition: { duration: 0.2 }
                      }}
                      style={{
                        backgroundColor: 'rgba(255, 111, 46, 1)',
                        borderColor: 'rgba(19, 0, 0, 1)',
                        color: 'rgba(19, 0, 0, 1)',
                        boxShadow: '2px 2px 0 rgba(19, 0, 0, 1)',
                      }}
                    >
                      AI
                    </motion.div>
                  )}

                  {/* 消息内容 */}
                  <div className="flex flex-col max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl">
                    {/* 进度消息 */}
                    {message.role === 'assistant' && message.progressMessages && message.progressMessages.length > 0 && (
                      <div className="mb-2 sm:mb-3 space-y-1 sm:space-y-2">
                        {message.progressMessages.map((progressMsg, progressIndex) => (
                          <div 
                            key={progressIndex}
                            className="p-1.5 sm:p-2 border border-solid text-xs opacity-70 transform rotate-[-0.05deg]"
                            style={{
                              backgroundColor: 'rgba(255, 239, 215, 0.5)',
                              borderColor: 'rgba(19, 0, 0, 0.3)',
                              color: 'rgba(19, 0, 0, 1)',
                            }}
                          >
                            {progressMsg}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 工具调用显示 (Agent模式) */}
                    {message.role === 'assistant' && message.toolCalls && Object.keys(message.toolCalls).length > 0 && (
                      <div className="mb-2 sm:mb-3 space-y-1 sm:space-y-2">
                        {Object.entries(message.toolCalls).map(([toolName, toolCall]) => (
                          <ToolCallDisplay 
                            key={toolName}
                            toolCall={toolCall}
                            progress={message.toolProgress?.[toolName]}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* 资源卡片 */}
                    {message.role === 'assistant' && message.resources && message.resources.length > 0 && (
                      <div className="mb-2 sm:mb-3 w-full">
                        <ResourceCard resources={message.resources} className="w-full" />
                      </div>
                    )}
                    
                    {/* 正常消息内容 */}
                    {message.content && (
                      <motion.div 
                        className={`p-2 sm:p-3 md:p-4 border-2 border-solid`}
                        whileHover={{ 
                          scale: 1.01,
                          rotate: message.role === 'user' ? 0.3 : -0.2,
                          transition: { duration: 0.2 }
                        }}
                        style={{
                          backgroundColor: message.role === 'user' 
                            ? 'rgba(255, 239, 215, 1)' 
                            : 'rgba(255, 248, 232, 1)',
                          borderColor: 'rgba(19, 0, 0, 1)',
                          color: 'rgba(19, 0, 0, 1)',
                          boxShadow: '3px 3px 0 rgba(19, 0, 0, 1)',
                        }}
                      >
                        <pre className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm break-words prose prose-stone lg:prose-base sm:prose-base">
                          {message.content}
                          {/* 只在最后一条AI消息且正在加载且有内容时显示闪烁光标 */}
                          {isLastAIMessage && isAgentStreaming && message.content && (
                            <span className="animate-pulse ml-1">▊</span>
                          )}
                        </pre>
                      </motion.div>
                    )}
                    
                    {/* 加载状态 */}
                    {isLastAIMessage && isAgentStreaming && !message.content && (
                      <div 
                        className="p-2 sm:p-3 md:p-4 border-2 border-solid transform rotate-[-0.1deg]"
                        style={{
                          backgroundColor: 'rgba(255, 248, 232, 1)',
                          borderColor: 'rgba(19, 0, 0, 1)',
                          color: 'rgba(19, 0, 0, 1)',
                        }}
                      >
                        <div className="text-xs sm:text-sm opacity-70">
                          {message.isThinking ? `🧠 ${t('chat.thinking')}` : t('chat.thinking')}
                        </div>
                      </div>
                    )}
                    
                    {/* 只在消息有内容或资源时显示时间戳 */}
                    {(message.content || (message.resources && message.resources.length > 0)) && (
                      <div className="text-xs opacity-60 mt-0.5 sm:mt-1" 
                        style={{ color: 'rgba(19, 0, 0, 1)' }}>
                        {formatTime(message.timestamp)}
                      </div>
                    )}
                  </div>

                  {/* 用户头像 */}
                  {message.role === 'user' && (
                    <motion.div 
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-solid flex items-center justify-center font-bold flex-shrink-0 text-xs sm:text-sm md:text-base"
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 3,
                        transition: { duration: 0.2 }
                      }}
                      style={{
                        backgroundColor: 'rgba(255, 248, 232, 1)',
                        borderColor: 'rgba(19, 0, 0, 1)',
                        color: 'rgba(19, 0, 0, 1)',
                        boxShadow: '2px 2px 0 rgba(19, 0, 0, 1)',
                      }}
                    >
                      {t('chat.userAvatar')}
                    </motion.div>
                  )}
                </motion.div>
                );
              })}

              {/* Agent模式实时工具进度显示（在流式输出时显示） */}
              {isAgentStreaming && Object.keys(toolProgress).length > 0 && (
                <div className="flex gap-2 sm:gap-3 md:gap-4 justify-start scrollbar-hide">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-solid flex items-center justify-center font-bold flex-shrink-0 transform rotate-[-0.3deg] text-xs sm:text-sm md:text-base"
                    style={{
                      backgroundColor: 'rgba(255, 111, 46, 1)',
                      borderColor: 'rgba(19, 0, 0, 1)',
                      color: 'rgba(19, 0, 0, 1)',
                    }}
                  >
                    🔧
                  </div>
                  <div className="flex flex-col max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl space-y-1 sm:space-y-2">
                    {Object.entries(toolProgress).map(([toolName, progress]) => {
                      const getStepIcon = (step: string) => {
                        switch (step) {
                          case 'analyzing': return '🔍';
                          case 'intent': return '🤖';
                          case 'tags': return '🏷️';
                          case 'searching': return '📚';
                          case 'candidates': return '📊';
                          case 'selecting': return '✨';
                          case 'completed': return '✅';
                          case 'warning': return '⚠️';
                          case 'error': return '❌';
                          default: return '⚙️';
                        }
                      };

                      return (
                        <div 
                          key={toolName}
                          className="p-2 sm:p-3 border-2 border-solid transform rotate-[-0.05deg]"
                          style={{
                            backgroundColor: 'rgba(255, 248, 232, 1)',
                            borderColor: 'rgba(255, 111, 46, 1)',
                            color: 'rgba(19, 0, 0, 1)',
                          }}
                        >
                          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <span className="text-sm sm:text-base md:text-lg">🔧</span>
                            <span className="font-bold text-xs sm:text-sm truncate">{toolName}</span>
                            {progress.step && (
                              <span className="text-xs sm:text-sm opacity-70 truncate">
                                {getStepIcon(progress.step)} 
                                <span className="hidden sm:inline">{progress.step}</span>
                              </span>
                            )}
                          </div>
                          
                          {progress.message && (
                            <div className="text-xs mb-1 sm:mb-2 break-words" style={{ color: 'rgba(19, 0, 0, 0.8)' }}>
                              {progress.message}
                            </div>
                          )}
                          
                          {progress.progress !== undefined && (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="flex-1 h-1.5 sm:h-2 bg-gray-300 border border-solid border-black">
                                <div 
                                  className="h-full bg-orange-500 transition-all duration-300"
                                  style={{ width: `${progress.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono">{progress.progress}%</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 错误提示 */}
              {agentError && (
                <div className="flex gap-2 sm:gap-3 md:gap-4 justify-start">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-2 border-solid flex items-center justify-center font-bold flex-shrink-0 transform rotate-[-0.3deg] text-xs sm:text-sm md:text-base"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 1)',
                      borderColor: 'rgba(19, 0, 0, 1)',
                      color: 'rgba(255, 255, 255, 1)',
                    }}
                  >
                    !
                  </div>
                  <div 
                    className="p-2 sm:p-3 md:p-4 border-2 border-solid transform rotate-[-0.1deg] max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl"
                    style={{
                      backgroundColor: 'rgba(254, 242, 242, 1)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      color: 'rgba(239, 68, 68, 1)',
                    }}
                  >
                    <div className="text-xs sm:text-sm break-words">{agentError}</div>
                  </div>
                </div>
              )}
            </div>
            </AnimatePresence>
          )}
          
          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div 
          className="border-t-2 border-solid pt-3 sm:pt-4 md:pt-6"
          style={{ borderColor: 'rgba(19, 0, 0, 1)' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('chat.inputPlaceholder')}
              className="flex-1 p-2 sm:p-3 md:p-4 border-2 border-solid focus:outline-none transition-all text-sm sm:text-base resize-none"
              style={{
                backgroundColor: 'rgba(255, 248, 232, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
                fontFamily: '"Menlo", "Consolas", "Courier_New", "Hannotate_SC", "DengXian", monospace',
                boxShadow: '3px 3px 0 rgba(19, 0, 0, 1)',
                minHeight: '80px', // 确保最小高度便于触摸
              }}
              rows={3} // 响应式高度通过CSS控制
              disabled={isAgentStreaming}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <motion.button
              type="submit"
              disabled={isAgentStreaming || !inputMessage.trim()}
              className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 border-2 border-solid font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base min-h-[48px] sm:min-h-[52px] md:min-h-auto flex items-center justify-center"
              whileHover={{ 
                scale: 1.02,
                rotate: 0.3,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: 'rgba(255, 111, 46, 1)',
                borderColor: 'rgba(19, 0, 0, 1)',
                color: 'rgba(19, 0, 0, 1)',
                boxShadow: '3px 3px 0 rgba(19, 0, 0, 1)',
              }}
            >
              {isAgentStreaming ? (
              <div className="flex items-center gap-1 sm:gap-2">
                  <LoadingDots text="" />
                  <span className="hidden sm:inline">{t('chat.sending')}</span>
                </div>
              ) : (
                t('chat.send')
              )}
            </motion.button>
          </form>
          
          <div className="mt-1 sm:mt-2 text-xs opacity-60 text-center sm:text-left" style={{ color: 'rgba(19, 0, 0, 1)' }}>
            <span className="hidden sm:inline">{t('chat.enterHintDesktop')}</span>
            <span className="sm:hidden">{t('chat.enterHintMobile')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chat;
