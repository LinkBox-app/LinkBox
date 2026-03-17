import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useAgentStream } from '../hooks/useAgentStream';
import ToolProgressCard from './ToolProgressCard';
import type { ChatMessage } from '../hooks/useAgentStream';

interface AgentChatProps {
  onClose?: () => void;
}

const AgentChat: React.FC<AgentChatProps> = ({ onClose }) => {
  const { t } = useI18n();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isStreaming,
    currentThinking,
    toolCalls,
    toolProgress,
    finalResponse,
    error,
    sendMessage,
    cancelStream,
  } = useAgentStream();

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentThinking, toolProgress, finalResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      await sendMessage(newMessages);
      // 等待响应完成后，将最终响应添加到消息列表
      if (finalResponse) {
        setMessages(prev => [...prev, { role: 'assistant', content: finalResponse }]);
      }
    } catch (err) {
      console.error('发送消息失败:', err);
    }
  };

  // 当收到最终响应时，添加到消息列表
  useEffect(() => {
    if (finalResponse && !isStreaming) {
      setMessages(prev => {
        // 检查最后一条消息是否已经是这个响应
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.content === finalResponse) {
          return prev;
        }
        return [...prev, { role: 'assistant', content: finalResponse }];
      });
    }
  }, [finalResponse, isStreaming]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">{t('agentChat.title')}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 消息显示区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 历史消息 */}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* AI思考过程 */}
        {currentThinking && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg animate-pulse">🧠</span>
              <span className="text-sm text-blue-600 font-medium">{t('agentChat.thinking')}</span>
            </div>
            <div className="text-sm text-gray-700">{currentThinking}</div>
          </div>
        )}

        {/* 工具进度显示 */}
        {Object.entries(toolProgress).map(([toolName, progress]) => (
          <ToolProgressCard
            key={toolName}
            toolName={toolName}
            progress={progress}
          />
        ))}

        {/* 工具调用结果（仅显示已完成且没有进度信息的） */}
        {Object.entries(toolCalls)
          .filter(([toolName, toolData]) => 
            toolData.status === 'completed' && 
            (!toolProgress[toolName] || toolProgress[toolName].step === 'completed')
          )
          .map(([toolName, toolData]) => (
            <div key={toolName} className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span>🔧</span>
                <span className="text-sm font-medium">{toolName} {t('agentChat.toolCompleted')}</span>
              </div>
              {toolData.output && (
                <div className="text-xs bg-white p-2 rounded border">
                  <pre className="whitespace-pre-wrap overflow-x-auto">
                    {typeof toolData.output === 'string' 
                      ? toolData.output 
                      : JSON.stringify(toolData.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>❌</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('agentChat.inputPlaceholder')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={cancelStream}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              {t('agentChat.cancel')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('agentChat.send')}
            </button>
          )}
        </div>
        {isStreaming && (
          <div className="mt-2 text-xs text-gray-500">
            {t('agentChat.processing')}
          </div>
        )}
      </form>
    </div>
  );
};

export default AgentChat;
