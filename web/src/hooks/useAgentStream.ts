import { useCallback, useState } from "react";
import { AUTH_TOKEN_KEY } from "../storage-key.constant";
import { BASE_URL } from "../api";

// 事件类型
export type StreamEventType =
  | "thinking" // AI思考过程
  | "tool_call" // 工具调用开始
  | "tool_result" // 工具调用结果
  | "tool_progress" // 工具执行进度
  | "response" // 最终响应
  | "error" // 错误
  | "done" // 完成
  | "resource"; // 资源数据

// 流事件数据
export interface StreamEvent {
  type: StreamEventType;
  content?: string;
  tool_name?: string;
  tool_input?: any;
  tool_output?: any;
  status?: string;
  step?: string;
  message?: string;
  progress?: number;
  data?: any;
  error?: string;
  metadata?: any;
  timestamp?: number;
  resources?: any[]; // 新增：资源数据
  count?: number; // 新增：资源数量
}

// 工具进度信息
export interface ToolProgress {
  tool_name: string;
  step: string;
  message: string;
  progress?: number;
  data?: any;
  timestamp: number;
}

// 工具调用信息
export interface ToolCallInfo {
  tool_name: string;
  input: any;
  output?: any;
  status: "calling" | "completed" | "error";
  error?: string;
}

// 消息类型
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Agent流状态
export interface AgentStreamState {
  isStreaming: boolean;
  currentThinking: string;
  toolCalls: { [key: string]: ToolCallInfo };
  toolProgress: { [key: string]: ToolProgress };
  finalResponse: string;
  error: string | null;
  resources: any[]; // 新增：资源列表
}

// Hook返回类型
export interface UseAgentStreamReturn extends AgentStreamState {
  sendMessage: (messages: ChatMessage[]) => Promise<void>;
  cancelStream: () => void;
}

export const useAgentStream = (): UseAgentStreamReturn => {
  const [state, setState] = useState<AgentStreamState>({
    isStreaming: false,
    currentThinking: "",
    toolCalls: {},
    toolProgress: {},
    finalResponse: "",
    error: null,
    resources: [], // 初始化资源列表
  });

  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const cancelStream = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setState((prev) => ({ ...prev, isStreaming: false }));
    }
  }, [abortController]);

  const handleStreamEvent = useCallback((event: StreamEvent) => {
    setState((prev) => {
      const newState = { ...prev };

      switch (event.type) {
        case "thinking":
          // 累积AI思考内容
          newState.currentThinking += event.content || "";
          break;

        case "tool_call":
          // 记录工具调用
          if (event.tool_name) {
            newState.toolCalls[event.tool_name] = {
              tool_name: event.tool_name,
              input: event.tool_input,
              status: "calling",
            };
          }
          break;

        case "tool_result":
          // 更新工具调用结果
          if (event.tool_name && newState.toolCalls[event.tool_name]) {
            newState.toolCalls[event.tool_name] = {
              ...newState.toolCalls[event.tool_name],
              output: event.tool_output,
              status: "completed",
            };
          }
          break;

        case "tool_progress":
          // 更新工具进度
          if (event.tool_name) {
            newState.toolProgress[event.tool_name] = {
              tool_name: event.tool_name,
              step: event.step || "",
              message: event.message || "",
              progress: event.progress,
              data: event.data,
              timestamp: event.timestamp || Date.now(),
            };
          }
          break;

        case "resource":
          // 接收资源数据
          if (event.resources) {
            newState.resources = event.resources;
          }
          break;

        case "response":
          // 最终响应（累积）
          newState.finalResponse += event.content || "";
          newState.currentThinking = "";
          break;

        case "error":
          newState.error = event.error || event.message || "未知错误";
          newState.isStreaming = false;
          break;

        case "done":
          newState.isStreaming = false;
          break;
      }

      return newState;
    });
  }, []);

  const sendMessage = useCallback(
    async (messages: ChatMessage[]): Promise<void> => {
      // 重置状态
      setState({
        isStreaming: true,
        currentThinking: "",
        toolCalls: {},
        toolProgress: {},
        finalResponse: "",
        error: null,
        resources: [], // 重置资源列表
      });

      // 创建新的AbortController
      const controller = new AbortController();
      setAbortController(controller);

      // 获取认证token
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: "未找到认证token，请重新登录",
        }));
        throw new Error("未找到认证token");
      }

      try {
        const response = await fetch(`${BASE_URL}/ai/chat/agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ messages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法获取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let shouldBreak = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // 保留最后一行（可能不完整）
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const eventData: StreamEvent = JSON.parse(line.slice(6));
                handleStreamEvent(eventData);

                // 如果收到 done 事件，标记需要跳出循环
                if (eventData.type === "done") {
                  shouldBreak = true;
                }
              } catch (e) {
                console.error("解析SSE数据失败:", e);
              }
            }
          }

          // 如果收到了 done 事件，跳出循环
          if (shouldBreak) {
            reader.cancel(); // 取消读取器
            break;
          }
        }

        // 处理剩余的 buffer
        if (buffer.trim() && buffer.startsWith("data: ")) {
          try {
            const eventData: StreamEvent = JSON.parse(buffer.slice(6));
            handleStreamEvent(eventData);
          } catch (e) {
            console.error("解析剩余SSE数据失败:", e);
          }
        }
      } finally {
        setAbortController(null);
        // 注意：这里不再设置 isStreaming = false，因为 done 事件已经处理了
      }
    },
    [handleStreamEvent]
  );

  return {
    ...state,
    sendMessage,
    cancelStream,
  };
};
