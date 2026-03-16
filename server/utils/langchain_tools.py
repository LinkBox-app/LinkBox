"""LangChain 工具定义"""
import asyncio
import json
import time
from typing import Any, Callable, Dict, Optional, Type, List

from langchain_core.tools import BaseTool
from langchain_core.output_parsers import JsonOutputParser, PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from crud import resource_crud, tag_crud
from models import Resource, User
from errors import BusinessError
from utils.ai_client import create_chat_model
from utils.web_scraper import fetch_web_content_to_markdown

class TagSelectionOutput(BaseModel):
    """AI标签选择输出模型"""
    selected_tags: List[str] = Field(description="选择的相关标签列表")

class ResourceSelectionOutput(BaseModel):
    """AI资源选择输出模型"""
    selected_resource_ids: List[int] = Field(description="选择的资源ID列表")


class ResourceSummary(BaseModel):
    """AI 生成的资源摘要模型"""
    title: str = Field(..., description="资源标题")
    tags: List[str] = Field(..., description="资源标签")
    digest: str = Field(..., description="资源摘要")


class ResourcePreviewInput(BaseModel):
    """资源预览输入参数"""
    url: str = Field(description="要预览的网页URL")
    note: str = Field(default="", description="用户备注（可选）")


class CreateResourceInput(BaseModel):
    """创建资源输入参数"""
    url: str = Field(description="资源URL")
    title: str = Field(description="资源标题")
    tags: List[str] = Field(description="资源标签列表")
    digest: str = Field(description="资源摘要")


class SearchQuery(BaseModel):
    """搜索查询参数"""
    query: str = Field(description="搜索关键词")
    limit: int = Field(default=10, description="返回结果数量限制")


class StreamingTool(BaseTool):
    """支持流式输出的工具基类"""
    progress_callback: Optional[Callable] = None
    
    class Config:
        """Pydantic配置"""
        arbitrary_types_allowed = True
    
    async def emit_progress(self, step: str, message: str, progress: int = None, data: Any = None):
        """发送进度信息"""
        print(f"[SearchResourcesTool] Emitting progress: step={step}, message={message}")
        if self.progress_callback:
            await self.progress_callback({
                "type": "tool_progress",
                "tool_name": self.name,
                "step": step,
                "message": message,
                "progress": progress,
                "data": data,
                "timestamp": time.time()
            })
        else:
            print(f"[SearchResourcesTool] No progress_callback set!")
    
    def _run(self, *args, **kwargs):
        """同步运行（不推荐使用）"""
        return asyncio.run(self._arun(*args, **kwargs))

    def build_llm(self):
        """根据当前用户配置创建非流式 LLM。"""
        user_id = getattr(self, "user_id", None)
        db = getattr(self, "db", None)
        if not user_id or db is None:
            raise ValueError("工具未正确初始化：缺少 user_id 或 db")
        return create_chat_model(db, user_id, streaming=False)


class SearchResourcesTool(StreamingTool):
    """搜索资源工具（基于真实的资源搜索工作流）"""
    name: str = "search_resources"
    description: str = "搜索用户收藏的资源，支持标题、标签、描述等多维度搜索"
    args_schema: Type[BaseModel] = SearchQuery
    
    # 添加必要的属性
    user_id: Optional[int] = None
    db: Optional[Session] = None
    
    async def _arun(self, query: str, limit: int = 10) -> str:
        """异步执行搜索 - 直接实现资源搜索工作流"""
        try:
            if not self.user_id or not self.db:
                raise ValueError("工具未正确初始化：缺少 user_id 或 db")
            
            # 步骤1：获取用户所有标签
            await self.emit_progress("analyzing", "🔍 正在分析您的搜索需求...", 10)
            
            print(f"[步骤1] 获取用户 {self.user_id} 的所有标签...")
            user_tags = tag_crud.get_user_tags(self.db, self.user_id)
            
            if not user_tags:
                await self.emit_progress("warning", "⚠️ 您还没有收藏任何资源，请先添加一些资源到您的收藏夹", 100)
                print("用户暂无任何标签")
                return json.dumps({
                    "success": True,
                    "query": query,
                    "count": 0,
                    "message": "您还没有收藏任何资源，请先添加一些资源到您的收藏夹"
                }, ensure_ascii=False)
            
            tag_names = [tag.name for tag in user_tags]
            print(f"用户标签: {tag_names}")
            
            # 步骤2：AI分析用户意图，选出相关标签
            await self.emit_progress("intent", "🤖 AI正在分析您的搜索意图...", 20)
            
            print(f"[步骤2] AI分析用户意图: '{query}'")
            selected_tags = await self._select_relevant_tags(query, tag_names)
            print(f"AI选择的相关标签: {selected_tags}")
            
            if not selected_tags:
                await self.emit_progress("warning", "⚠️ 未找到与您的搜索相关的标签，请尝试使用不同的关键词", 100)
                print("AI未找到相关标签")
                return json.dumps({
                    "success": True,
                    "query": query,
                    "count": 0,
                    "message": "未找到与您的搜索相关的标签，请尝试使用不同的关键词"
                }, ensure_ascii=False)
            
            await self.emit_progress("tags", f"🏷️ 找到相关标签：{', '.join(selected_tags)}", 30)
            
            # 步骤3：获取选中标签下的所有资源标题和ID
            await self.emit_progress("searching", "📚 正在搜索相关资源...", 40)
            
            print(f"[步骤3] 获取标签下的资源...")
            resource_candidates = []
            resource_cache = {}  # 缓存资源对象，避免步骤5重复查询
            
            for tag_name in selected_tags:
                # 获取该标签下的资源
                try:
                    resources_data, total_count = resource_crud.get_resources_by_tag(
                        self.db,
                        self.user_id,
                        tag_name,
                        page=1,
                        size=100,  # 获取足够多的资源
                    )
                    
                    if resources_data is None:
                        print(f"警告：标签 '{tag_name}' 返回了None结果")
                        continue
                    
                    print(f"标签 '{tag_name}' 下找到 {len(resources_data)} 个资源")
                    
                except Exception as e:
                    print(f"获取标签 '{tag_name}' 下的资源失败: {str(e)}")
                    continue
                
                for item in resources_data:
                    resource = item["resource"]
                    # 避免重复资源
                    if not any(r["id"] == resource.id for r in resource_candidates):
                        resource_candidates.append(
                            {"id": resource.id, "title": resource.title}
                        )
                        # 缓存完整的资源对象
                        resource_cache[resource.id] = resource
            
            print(f"候选资源数量: {len(resource_candidates)}")
            
            if not resource_candidates:
                await self.emit_progress("warning", "⚠️ 在相关标签下未找到任何资源", 100)
                print("所选标签下无资源")
                return json.dumps({
                    "success": True,
                    "query": query,
                    "count": 0,
                    "message": "在相关标签下未找到任何资源"
                }, ensure_ascii=False)
            
            await self.emit_progress("candidates", f"📊 找到 {len(resource_candidates)} 个候选资源，AI正在筛选最匹配的资源...", 60)
            
            # 步骤4：AI从资源列表中选出匹配的资源ID
            print(f"[步骤4] AI从 {len(resource_candidates)} 个候选资源中选择匹配项")
            selected_resource_ids = await self._select_matching_resources(query, resource_candidates)
            print(f"AI选择的资源ID: {selected_resource_ids}")
            
            if not selected_resource_ids:
                await self.emit_progress("warning", "⚠️ AI未找到与您的需求匹配的资源", 100)
                print("AI未找到匹配的资源")
                return json.dumps({
                    "success": True,
                    "query": query,
                    "count": 0,
                    "message": "AI未找到与您的需求匹配的资源"
                }, ensure_ascii=False)
            
            await self.emit_progress("selecting", f"✨ AI选出了 {len(selected_resource_ids)} 个最匹配的资源", 80)
            
            # 步骤5：根据ID查询完整资源信息（使用缓存）
            print(f"[步骤5] 从缓存中获取完整资源信息")
            final_results = []
            
            for resource_id in selected_resource_ids:
                # 直接从缓存中获取资源对象，避免重复查询数据库
                if resource_id in resource_cache:
                    final_results.append(resource_cache[resource_id])
                else:
                    # 如果缓存中没有（理论上不应该发生），则查询数据库
                    print(f"警告：资源ID {resource_id} 不在缓存中，执行数据库查询")
                    resource = resource_crud.get_resource_by_id(self.db, resource_id, self.user_id)
                    if resource:
                        final_results.append(resource)
            
            print(f"工作流完成，返回 {len(final_results)} 个匹配资源")
            
            # 发送资源数据到前端（新增：通过SSE发送资源卡片）
            if final_results and self.progress_callback:
                # 序列化资源数据，匹配前端 ResourceCard 组件的接口
                resources_data = []
                for resource in final_results[:limit]:
                    resource_dict = {
                        "id": resource.id,
                        "title": resource.title,
                        "url": resource.url,
                        "digest": resource.digest,  # 使用正确的字段名 digest
                        "tags": [],  # 标签需要额外查询，暂时为空
                        "created_at": resource.created_at.isoformat() if resource.created_at else None,
                    }
                    resources_data.append(resource_dict)
                
                # 发送资源数据事件
                print(f"[SearchResourcesTool] Sending resource event with {len(resources_data)} resources")
                await self.progress_callback({
                    "type": "resource",
                    "resources": resources_data,
                    "count": len(resources_data),
                    "timestamp": time.time()
                })
            
            await self.emit_progress("completed", f"✅ 搜索完成！为您找到了 {len(final_results)} 个匹配的资源", 100)
            
            # 返回格式化的结果（供LLM使用）
            if not final_results:
                return json.dumps({
                    "success": True,
                    "query": query,
                    "count": 0,
                    "message": f"未找到与 '{query}' 相关的资源"
                }, ensure_ascii=False)
            
            # 构建简化的结果摘要供LLM使用
            results_summary = []
            for i, resource in enumerate(final_results[:limit]):
                results_summary.append({
                    "index": i + 1,
                    "title": resource.title,
                    "url": resource.url,
                    "description": resource.digest[:100] + "..." if len(resource.digest) > 100 else resource.digest
                })
            
            return json.dumps({
                "success": True,
                "query": query,
                "count": len(final_results),
                "total": len(final_results),
                "results": results_summary,
                "message": f"找到了 {len(final_results)} 个与 '{query}' 相关的资源，已为您展示在卡片中"
            }, ensure_ascii=False)
            
        except Exception as e:
            await self.emit_progress("error", f"搜索失败: {str(e)}", 0)
            return json.dumps({
                "success": False,
                "error": str(e),
                "query": query
            }, ensure_ascii=False)
    
    async def _select_relevant_tags(self, user_query: str, available_tags: List[str]) -> List[str]:
        """AI选择与用户查询相关的标签"""
        if not available_tags:
            return []
        
        # 设置JSON输出解析器（使用Pydantic模型）
        parser = JsonOutputParser(pydantic_object=TagSelectionOutput)
        
        # 创建提示模板（使用partial_variables设置format_instructions）
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                """用户有一个链接资源收藏夹，每个资源有多个标签，用户会告诉你他想要什么样的资源，你需要从给定的标签列表中选择几个最相关的标签。
<选择原则>
1. 选择与用户需求直接相关的标签
2. 最多选择3-5个标签（避免结果过多）
3. 如果用户需求模糊，选择最可能匹配的标签
4. 如果没有相关标签，返回空列表
</选择原则>
{format_instructions}""",
            ),
            (
                "human",
                "<用户输入>{user_query}</用户输入>\n<可用标签>{available_tags}</可用标签>\n，请选择相关标签。",
            ),
        ]).partial(format_instructions=parser.get_format_instructions())
        
        # 构建链
        chain = prompt | self.build_llm() | parser
        
        try:
            # 使用 asyncio.run_in_executor 将同步调用转为异步
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, chain.invoke, {
                "user_query": user_query,
                "available_tags": available_tags,
            })
            
            print(f"AI返回结果类型: {type(result)}, 值: {result}")
            
            # 处理不同类型的返回结果
            if isinstance(result, dict):
                selected_tags = result.get("selected_tags", [])
            elif hasattr(result, "selected_tags"):
                selected_tags = result.selected_tags
            else:
                print(f"意外的结果类型: {type(result)}, 值: {result}")
                selected_tags = []
            
            print(f"AI选择的标签（原始）: {selected_tags}")
            
            # 验证选择的标签是否在可用标签中
            valid_tags = [tag for tag in selected_tags if tag in available_tags]
            return valid_tags
            
        except Exception as e:
            print(f"标签选择失败: {str(e)}")
            # 兜底策略：简单关键词匹配
            user_query_lower = user_query.lower()
            fallback_tags = []
            for tag in available_tags:
                if any(keyword in tag.lower() for keyword in user_query_lower.split()):
                    fallback_tags.append(tag)
            return fallback_tags[:3]  # 最多返回3个
    
    async def _select_matching_resources(self, user_query: str, resource_candidates: List[Dict]) -> List[int]:
        """AI从候选资源中选择最匹配用户需求的资源"""
        if not resource_candidates:
            return []
        
        # 创建资源列表字符串
        resources_text = "\n".join([f"ID: {r['id']}, 标题: {r['title']}" for r in resource_candidates])
        
        # 设置JSON输出解析器（使用Pydantic模型）
        parser = JsonOutputParser(pydantic_object=ResourceSelectionOutput)
        
        # 创建提示模板（使用partial_variables设置format_instructions）
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                """你是一个智能资源选择助手，用户有一个链接资源收藏夹，现在用户想要找某个或者某些资源，你需要从候选资源列表中选择最匹配的资源。
<选择原则>
1. 资源标题要与用户需求相关
2. 优先选择更具体、更准确匹配的资源
3. 最多选择5个资源（避免信息过载）
4. 如果没有相关资源，返回空列表
</选择原则>
{format_instructions}""",
            ),
            (
                "human",
                "<用户输入>{user_query}</用户输入>\n<候选资源>{resources_text}</候选资源>\n请选择最匹配的资源ID：",
            ),
        ]).partial(format_instructions=parser.get_format_instructions())
        
        # 构建链
        chain = prompt | self.build_llm() | parser
        
        try:
            # 使用 asyncio.run_in_executor 将同步调用转为异步
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(None, chain.invoke, {
                "user_query": user_query,
                "resources_text": resources_text,
            })
            
            # 处理不同类型的返回结果
            if isinstance(result, dict):
                selected_ids = result.get("selected_resource_ids", [])
            elif hasattr(result, "selected_resource_ids"):
                selected_ids = result.selected_resource_ids
            else:
                print(f"意外的结果类型: {type(result)}, 值: {result}")
                selected_ids = []
            
            # 验证ID是否存在于候选列表中
            valid_ids = []
            candidate_ids = [r["id"] for r in resource_candidates]
            
            for resource_id in selected_ids:
                if resource_id in candidate_ids:
                    valid_ids.append(resource_id)
            
            return valid_ids
            
        except Exception as e:
            print(f"资源选择失败: {str(e)}")
            # 兜底策略：基于关键词简单匹配
            user_keywords = user_query.lower().split()
            fallback_ids = []
            
            for resource in resource_candidates:
                title_lower = resource["title"].lower()
                if any(keyword in title_lower for keyword in user_keywords):
                    fallback_ids.append(resource["id"])
            
            return fallback_ids


class ResourcePreviewTool(StreamingTool):
    """资源预览工具 - 根据URL生成资源预览信息"""
    name: str = "preview_resource"
    description: str = "根据URL生成资源预览，包括标题、标签和摘要。用于帮助用户收藏网页资源前的预览。"
    args_schema: Type[BaseModel] = ResourcePreviewInput
    
    # 添加必要的属性
    user_id: Optional[int] = None
    db: Optional[Session] = None
    
    async def _arun(self, url: str, note: str = "") -> str:
        """异步执行资源预览生成"""
        try:
            if not self.user_id or not self.db:
                raise ValueError("工具未正确初始化：缺少 user_id 或 db")
            
            # 步骤1：爬取网页内容
            await self.emit_progress("fetching", "🌐 正在获取网页内容...", 20)
            
            try:
                web_content = fetch_web_content_to_markdown(url)
                if not web_content:
                    await self.emit_progress("error", "❌ 无法获取网页内容", 0)
                    return json.dumps({
                        "success": False,
                        "error": "无法获取网页内容，请检查URL是否正确"
                    }, ensure_ascii=False)
                
                # 限制内容长度
                if len(web_content) > 10000:
                    web_content = web_content[:10000] + "..."
                    
            except Exception as e:
                await self.emit_progress("error", f"❌ 获取网页内容失败: {str(e)}", 0)
                return json.dumps({
                    "success": False,
                    "error": f"获取网页内容失败: {str(e)}"
                }, ensure_ascii=False)
            
            await self.emit_progress("analyzing", "📝 正在分析网页内容...", 40)
            
            # 步骤2：获取用户已有标签
            user_tags = tag_crud.get_user_tags(self.db, self.user_id)
            user_tag_names = [tag.name for tag in user_tags] if user_tags else []
            
            await self.emit_progress("generating", "🤖 AI正在生成资源预览...", 60)
            
            # 步骤3：使用AI生成资源摘要
            try:
                # 构建Pydantic解析器
                parser = PydanticOutputParser(pydantic_object=ResourceSummary)
                
                # 构建标签参考信息
                tags_reference = ""
                if user_tag_names:
                    tags_reference = f"\n<用户已有标签>{', '.join(user_tag_names)}</用户已有标签>"
                
                # 创建提示模板
                prompt = ChatPromptTemplate.from_messages([
                    SystemMessagePromptTemplate.from_template(
                        template="""
你是一个网页内容提取总结专家，用户觉得一个网页链接的内容很好，想要收藏，你需要根据网页内容和用户的备注，提炼出网页内容的标题，摘要，以及3-5个标签(要求精简凝练)。

重要指导原则：
1. 网页内容是从链接中爬取的文本内容，可能会混杂很多广告，推荐等等无效信息，请你甄别明晰，找出链接真正的主要的内容。
2. 如果用户提供了已有标签列表，请优先考虑使用用户已有的标签，这样可以保持用户的标签分类习惯的一致性。
3. 你可以从用户已有标签中选择合适的标签，也可以生成新的标签，但要确保标签能准确反映内容特征。
4. 标签应该简洁明了，避免过于宽泛或过于具体。
5. 如果内容与用户已有标签高度匹配，优先使用已有标签；如果内容有新的特征，可以生成新标签。
"""
                    ),
                    HumanMessagePromptTemplate.from_template(
                        template="""
<网页内容>{web_content}</网页内容>
<用户备注>{user_note}</用户备注>
<用户已有标签>{tags_reference}</用户已有标签>
<输出要求>{format_instructions}</输出要求>
""",
                        input_variables=["web_content", "user_note", "tags_reference"],
                        partial_variables={
                            "format_instructions": parser.get_format_instructions()
                        },
                    ),
                ])
                
                # 创建链并执行
                chain = prompt | self.build_llm() | parser
                
                # 使用asyncio.run_in_executor执行同步调用
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, chain.invoke, {
                    "web_content": web_content,
                    "user_note": note,
                    "tags_reference": tags_reference,
                })
                
                await self.emit_progress("completed", "✅ 资源预览生成完成！", 100)
                
                # 返回预览结果
                return json.dumps({
                    "success": True,
                    "url": url,
                    "title": result.title,
                    "tags": result.tags,
                    "digest": result.digest,
                    "message": "资源预览生成成功，请检查并根据需要进行修改"
                }, ensure_ascii=False)
                
            except Exception as e:
                await self.emit_progress("error", f"❌ 生成资源预览失败: {str(e)}", 0)
                return json.dumps({
                    "success": False,
                    "error": f"生成资源预览失败: {str(e)}"
                }, ensure_ascii=False)
                
        except Exception as e:
            await self.emit_progress("error", f"❌ 预览失败: {str(e)}", 0)
            return json.dumps({
                "success": False,
                "error": str(e)
            }, ensure_ascii=False)


class CreateResourceTool(BaseTool):
    """创建资源工具 - 将资源保存到收藏夹"""
    name: str = "create_resource"
    description: str = "创建并保存资源到收藏夹。需要提供URL、标题、标签和摘要。"
    args_schema: Type[BaseModel] = CreateResourceInput
    
    # 添加必要的属性
    user_id: Optional[int] = None
    db: Optional[Session] = None
    
    def _run(self, url: str, title: str, tags: List[str], digest: str) -> str:
        """同步执行（转发到异步方法）"""
        return asyncio.run(self._arun(url, title, tags, digest))
    
    async def _arun(self, url: str, title: str, tags: List[str], digest: str) -> str:
        """异步执行创建资源"""
        try:
            if not self.user_id or not self.db:
                raise ValueError("工具未正确初始化：缺少 user_id 或 db")
            
            # 创建资源
            resource = resource_crud.create_resource(
                db=self.db,
                url=url,
                title=title,
                digest=digest,
                tags=tags,
                user_id=self.user_id
            )
            
            if resource:
                return json.dumps({
                    "success": True,
                    "resource_id": resource.id,
                    "message": f"资源 '{title}' 已成功收藏！",
                    "url": url,
                    "tags": tags
                }, ensure_ascii=False)
            else:
                return json.dumps({
                    "success": False,
                    "error": "创建资源失败"
                }, ensure_ascii=False)
                
        except BusinessError as e:
            return json.dumps({
                "success": False,
                "error": str(e.message)
            }, ensure_ascii=False)
        except Exception as e:
            return json.dumps({
                "success": False,
                "error": f"创建资源失败: {str(e)}"
            }, ensure_ascii=False)


def get_tools(progress_callback: Optional[Callable] = None, user_id: Optional[int] = None, db: Optional[Session] = None) -> list:
    """获取所有可用工具"""
    tools = []
    
    # 创建搜索资源工具
    search_tool = SearchResourcesTool()
    search_tool.user_id = user_id
    search_tool.db = db
    if progress_callback:
        search_tool.progress_callback = progress_callback
    tools.append(search_tool)
    
    # 创建资源预览工具
    preview_tool = ResourcePreviewTool()
    preview_tool.user_id = user_id
    preview_tool.db = db
    if progress_callback:
        preview_tool.progress_callback = progress_callback
    tools.append(preview_tool)
    
    # 创建资源工具
    create_tool = CreateResourceTool()
    create_tool.user_id = user_id
    create_tool.db = db
    tools.append(create_tool)
    
    return tools
