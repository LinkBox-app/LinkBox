import alova from '../index';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

// AI流式对话接口（用于常规alova请求，如果需要的话）
export const aiChatStream = (chatData: ChatRequest) =>
  alova.Post<any>("/ai/chat/stream", chatData);