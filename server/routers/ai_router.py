import asyncio
import json
from typing import AsyncGenerator, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing_extensions import Annotated, TypedDict

from config import settings
from database import get_db
from models import User
from schemas.ai_schemas import ChatRequest
from utils.auth import get_current_user
from utils.langchain_tools import get_tools

# 初始化路由器
router = APIRouter(prefix="/ai", tags=["AI对话"])

# 初始化LLM
llm = ChatOpenAI(
    base_url=settings.AI_BASE_URL,
    api_key=settings.AI_API_KEY,
    model=settings.AI_MODEL,
    streaming=True,  # 启用流式响应
)

# System Prompt
SYSTEM_PROMPT = """你是一个AI助手，请用中文回复"""

# Agent System Prompt
AGENT_SYSTEM_PROMPT = """你是一个智能资源管理助手，可以帮助用户搜索和管理他们收藏的资源。

你可以使用以下工具：
- search_resources: 搜索用户收藏的资源
- preview_resource: 根据URL生成资源预览（包括标题、标签和摘要）
- create_resource: 创建并保存资源到收藏夹

## 资源收藏流程
当用户想要收藏一个网页资源时，请按照以下流程操作：

1. **获取资源预览**：当用户提供一个URL（可能还有备注）时，使用 `preview_resource` 工具生成资源预览
2. **展示预览结果**：向用户展示生成的标题、标签和摘要，询问是否满意
3. **根据反馈调整**：如果用户有修改意见，根据用户的反馈直接修改预览内容（不需要再次调用工具）
4. **保存资源**：当用户确认满意后，使用 `create_resource` 工具将资源保存到收藏夹

## 注意事项
- 在展示预览时，请使用清晰的格式展示标题、标签和摘要
- 允许用户对预览内容进行多次修改，直到满意为止
- 只有在用户明确表示满意或同意保存时，才调用 `create_resource` 工具
- 如果用户只是想搜索已有资源，使用 `search_resources` 工具

请根据用户的需求选择合适的工具来完成任务。在调用工具时，请使用正确的参数格式。"""

# 注释：移除了全局的ProgressEventManager，改为在请求内部管理进度队列


@router.post("/chat/stream", summary="流式AI对话")
async def ai_chat_stream(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    流式AI对话接口

    - **messages**: 消息列表，包含历史消息和当前用户输入

    返回SSE格式的流式响应
    """
    try:
        # 检查是否有消息
        if not request.messages:
            raise HTTPException(status_code=400, detail="消息列表不能为空")

        # 构建完整的消息历史
        full_messages = []

        # 添加系统提示
        full_messages.append(SystemMessage(content=SYSTEM_PROMPT))

        # 添加所有消息（包括历史消息和当前用户输入）
        for msg in request.messages:
            if msg.role == "user":
                full_messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                full_messages.append(AIMessage(content=msg.content))
            # system消息已经在最前面添加了，这里跳过

        # 创建流式响应生成器
        async def generate_response() -> AsyncGenerator[str, None]:
            try:
                # 调用LLM流式生成
                async for chunk in llm.astream(full_messages):
                    if chunk.content:
                        # 格式化为SSE格式
                        data = {"type": "content", "content": chunk.content}
                        yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

                # 发送结束信号
                end_data = {"type": "done"}
                yield f"data: {json.dumps(end_data, ensure_ascii=False)}\n\n"

            except Exception as e:
                # 发送错误信息
                error_data = {"type": "error", "error": f"AI响应生成失败: {str(e)}"}
                yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"

        # 返回SSE流式响应
        return StreamingResponse(
            generate_response(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"流式对话失败: {str(e)}")


async def process_agent_event(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """处理 agent 事件并格式化为 SSE 数据"""
    event_kind = event.get("event")
    event_name = event.get("name", "")
    event_data = event.get("data", {})
    
    # 调试日志
    if event_kind not in ["on_chat_model_stream"]:  # 避免打印太多流数据
        print(f"[Agent Event] kind={event_kind}, name={event_name}")
    
    # AI 思考过程 (LLM 输出)
    if event_kind == "on_chat_model_stream":
        chunk = event_data.get("chunk")
        if chunk and hasattr(chunk, 'content') and chunk.content:
            return {
                "type": "thinking",
                "content": chunk.content,
                "metadata": {"model": settings.AI_MODEL}
            }
    
    # 工具调用开始
    elif event_kind == "on_tool_start":
        return {
            "type": "tool_call",
            "tool_name": event_name,
            "tool_input": event_data.get("input", {}),
            "status": "started"
        }
    
    # 工具调用结束
    elif event_kind == "on_tool_end":
        return {
            "type": "tool_result",
            "tool_name": event_name,
            "tool_output": event_data.get("output"),
            "status": "completed"
        }
    
    # Agent 最终输出
    elif event_kind == "on_chain_end" and event_name == "AgentExecutor":
        output = event_data.get("output", {})
        if "output" in output:
            return {
                "type": "response",
                "content": output["output"],
                "metadata": {"final": True}
            }
    
    # 错误处理
    elif event_kind == "on_tool_error":
        return {
            "type": "error",
            "tool_name": event_name,
            "error": str(event_data.get("error", "Unknown error"))
        }
    
    return None


@router.post("/chat/agent", summary="工具调用Agent流式对话")
async def ai_chat_agent(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    工具调用Agent流式对话接口
    
    支持：
    - 工具调用
    - 工具进度反馈
    - 流式响应
    """
    # 创建进度队列（每个请求独立的队列）
    progress_queue = asyncio.Queue()
    
    async def generate_response() -> AsyncGenerator[str, None]:
        try:
            # 创建进度回调函数（直接将进度数据放入队列）
            async def progress_callback(progress_data: Dict[str, Any]):
                print(f"[Progress Callback] Received: {progress_data.get('type', 'unknown')}")
                await progress_queue.put(progress_data)
            
            # 创建工具列表（传入必要参数）
            tools = get_tools(
                progress_callback=progress_callback,
                user_id=current_user.id,
                db=db
            )
            
            # 创建提示模板
            prompt = ChatPromptTemplate.from_messages([
                ("system", AGENT_SYSTEM_PROMPT),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ])
            
            # 创建 agent
            agent = create_tool_calling_agent(llm, tools, prompt)
            agent_executor = AgentExecutor(
                agent=agent, 
                tools=tools, 
                verbose=True,
                handle_parsing_errors=True,  # 这会导致 _Exception 工具
                max_iterations=3,  # 限制最大迭代次数
                early_stopping_method="generate"  # 更好的停止策略
            )
            
            # 构建聊天历史
            chat_history = []
            for i in range(0, len(request.messages) - 1):
                msg = request.messages[i]
                if msg.role == "user":
                    chat_history.append(HumanMessage(content=msg.content))
                elif msg.role == "assistant":
                    chat_history.append(AIMessage(content=msg.content))
            
            # 获取当前用户输入
            current_input = request.messages[-1].content if request.messages else ""
            
            # 创建两个异步生成器
            agent_stream = process_agent_stream(
                agent_executor, 
                {"input": current_input, "chat_history": chat_history}
            )
            progress_stream = process_progress_stream(progress_queue)
            
            # 并发处理两个流
            async for event_data in merge_streams(agent_stream, progress_stream):
                if event_data:
                    yield f"data: {json.dumps(event_data, ensure_ascii=False)}\n\n"
            
            # 发送完成信号
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            
        except Exception as e:
            error_data = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "X-Accel-Buffering": "no"
        }
    )


async def process_agent_stream(agent_executor: AgentExecutor, inputs: Dict[str, Any]):
    """处理 Agent 事件流"""
    async for event in agent_executor.astream_events(inputs, version="v2"):
        event_data = await process_agent_event(event)
        if event_data:
            yield event_data


async def process_progress_stream(progress_queue: asyncio.Queue):
    """处理进度事件流"""
    consecutive_timeouts = 0
    max_consecutive_timeouts = 50  # 连续超时5秒（50 * 0.1秒）后退出
    
    print("[Progress Stream] Started")
    
    while True:
        try:
            progress_data = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
            print(f"[Progress Stream] Got progress data: {progress_data.get('type', 'unknown')}")
            yield progress_data
            consecutive_timeouts = 0  # 收到数据时重置计数器
        except asyncio.TimeoutError:
            consecutive_timeouts += 1
            if consecutive_timeouts >= max_consecutive_timeouts:
                # 长时间没有新的进度数据，认为处理已完成
                print("[Progress Stream] Timeout reached, exiting")
                break
            continue
        except Exception as e:
            print(f"[Progress Stream] Error: {e}")
            break


async def merge_streams(*streams):
    """合并多个异步流"""
    queue = asyncio.Queue()
    tasks = []
    
    async def queue_events(stream, stream_index):
        try:
            async for event in stream:
                await queue.put((stream_index, event))
        except Exception as e:
            await queue.put((stream_index, {"type": "error", "message": str(e)}))
        finally:
            await queue.put((stream_index, None))  # 标记流结束
    
    # 为每个流创建任务
    for i, stream in enumerate(streams):
        task = asyncio.create_task(queue_events(stream, i))
        tasks.append(task)
    
    # 统计活跃的流
    active_streams = len(streams)
    agent_stream_ended = False  # 标记agent流是否已结束
    
    # 从队列中读取事件
    while active_streams > 0:
        stream_index, event = await queue.get()
        
        if event is None:
            # 如果是第一个流（agent_stream）结束，标记
            if stream_index == 0:
                agent_stream_ended = True
            active_streams -= 1
            
            # 如果agent流已结束且只剩progress流，可以提前结束
            if agent_stream_ended and active_streams == 1:
                # 取消剩余的progress流任务
                for task in tasks:
                    if not task.done():
                        task.cancel()
                break
        else:
            yield event
    
    # 等待所有任务完成或被取消
    await asyncio.gather(*tasks, return_exceptions=True)
