from typing import List, Literal, Optional, Dict, Any

from pydantic import BaseModel


class ToolCall(BaseModel):
    """工具调用模型"""
    id: str
    name: str
    args: Dict[str, Any]


class ChatMessage(BaseModel):
    """聊天消息模型"""

    role: Literal["user", "assistant", "system", "tool"]
    content: str
    tool_calls: Optional[List[ToolCall]] = None  # assistant消息可能包含工具调用
    tool_call_id: Optional[str] = None  # tool消息关联的调用ID


class ChatRequest(BaseModel):
    """聊天请求模型"""
    messages: List[ChatMessage]
