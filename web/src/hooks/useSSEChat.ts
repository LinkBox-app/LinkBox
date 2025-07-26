import { useState, useCallback } from 'react';
import { AUTH_TOKEN_KEY } from '../storage-key.constant';
import { BASE_URL } from '../api';

// 工具调用类型
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

// 消息类型
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[]; // assistant消息可能包含工具调用
  tool_call_id?: string;   // tool消息关联的调用ID
}

// SSE响应数据类型
interface SSEData {
  type: 'content' | 'chat' | 'progress' | 'resource_card' | 'done' | 'error';
  content?: string;
  error?: string;
  data?: any; // 额外数据，比如资源信息
}

// Hook返回类型
interface UseSSEChatReturn {
  isLoading: boolean;
  error: string | null;
  sendMessage: (
    messages: ChatMessage[], 
    onContent: (content: string) => void,
    onProgress: (message: string) => void,
    onResourceCard: (resources: any[]) => void,
    onComplete: () => void
  ) => Promise<void>;
  abortController: AbortController | null;
  cancelRequest: () => void;
}

export const useSSEChat = (): UseSSEChatReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const cancelRequest = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  }, [abortController]);

  const sendMessage = useCallback(async (
    messages: ChatMessage[], 
    onContent: (content: string) => void,
    onProgress: (message: string) => void,
    onResourceCard: (resources: any[]) => void,
    onComplete: () => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // 重置状态
      setError(null);
      setIsLoading(true);
      
      // 创建新的AbortController
      const controller = new AbortController();
      setAbortController(controller);

      // 获取认证token
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        setError('未找到认证token，请重新登录');
        reject(new Error('未找到认证token'));
        return;
      }

      // 准备请求数据
      const requestData = { messages };

      // 发送SSE请求
      fetch(`${BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('无法获取响应流');
          }

          const decoder = new TextDecoder();

          // 递归读取流数据
          const readStream = () => {
            reader.read()
              .then(({ done, value }) => {
                if (done) {
                  setIsLoading(false);
                  setAbortController(null);
                  onComplete();
                  resolve();
                  return;
                }

                // 解码数据
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                // 处理每一行SSE数据
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const dataStr = line.slice(6); // 去掉 "data: " 前缀
                      const data: SSEData = JSON.parse(dataStr);

                      switch (data.type) {
                        case 'content':
                        case 'chat':
                          if (data.content) {
                            // 实时调用回调函数，传递新的内容片段
                            onContent(data.content);
                          }
                          break;

                        case 'progress':
                          if (data.content) {
                            // 调用进度回调函数
                            onProgress(data.content);
                          }
                          break;

                        case 'resource_card':
                          if (data.data) {
                            // 调用资源卡片回调函数
                            onResourceCard(data.data);
                          }
                          break;

                        case 'done':
                          setIsLoading(false);
                          setAbortController(null);
                          onComplete();
                          resolve();
                          return;

                        case 'error':
                          setIsLoading(false);
                          setAbortController(null);
                          setError(data.error || '未知错误');
                          reject(new Error(data.error || '未知错误'));
                          return;
                      }
                    } catch (parseError) {
                      console.warn('SSE数据解析错误:', parseError);
                      // 继续处理其他数据，不中断流
                    }
                  }
                }

                // 继续读取下一块数据
                readStream();
              })
              .catch(readError => {
                if (controller.signal.aborted) {
                  setIsLoading(false);
                  setAbortController(null);
                  reject(new Error('请求已取消'));
                } else {
                  setIsLoading(false);
                  setAbortController(null);
                  setError('读取响应流失败');
                  reject(readError);
                }
              });
          };

          readStream();
        })
        .catch(fetchError => {
          if (controller.signal.aborted) {
            setIsLoading(false);
            setAbortController(null);
            reject(new Error('请求已取消'));
          } else {
            setIsLoading(false);
            setAbortController(null);
            setError('网络请求失败');
            reject(fetchError);
          }
        });
    });
  }, []);

  return {
    isLoading,
    error,
    sendMessage,
    abortController,
    cancelRequest,
  };
};