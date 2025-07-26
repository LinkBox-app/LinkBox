from typing import Any, Callable, Dict, List, Optional

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from config import settings
from crud import resource_crud, tag_crud
from database import get_db
from models import Resource

# 非流式LLM（用于工作流中的结构化输出）
llm = ChatOpenAI(
    base_url=settings.AI_BASE_URL,
    api_key=settings.AI_API_KEY,
    model=settings.AI_MODEL,
    streaming=False,
    # temperature=0.1,  # 让AI更准确
)


class TagSelectionOutput(BaseModel):
    """AI标签选择输出模型"""

    selected_tags: List[str] = Field(description="选择的相关标签列表")


class ResourceSelectionOutput(BaseModel):
    """AI资源选择输出模型"""

    selected_resource_ids: List[int] = Field(description="选择的资源ID列表")


def resource_search_workflow(
    user_query: str,
    user_id: int,
    db: Session,
    progress_callback: Optional[Callable[[str], None]] = None,
) -> List[Resource]:
    """
    资源搜索工作流

    工作流步骤：
    1. 获取用户所有标签
    2. AI分析用户意图，选出相关标签
    3. 获取这些标签下所有资源的标题和ID
    4. AI从资源列表中选出匹配的资源ID
    5. 根据ID查询完整资源信息

    Args:
        user_query: 用户查询内容
        user_id: 用户ID
        db: 数据库会话
        progress_callback: 进度回调函数

    Returns:
        匹配的资源对象列表
    """
    try:
        # 步骤1：获取用户所有标签
        if progress_callback:
            progress_callback("🔍 正在分析您的搜索需求...")

        print(f"[步骤1] 获取用户 {user_id} 的所有标签...")
        user_tags = tag_crud.get_user_tags(db, user_id)

        if not user_tags:
            if progress_callback:
                progress_callback(
                    "⚠️ 您还没有收藏任何资源，请先添加一些资源到您的收藏夹"
                )
            print("用户暂无任何标签")
            return []

        tag_names = [tag.name for tag in user_tags]
        print(f"用户标签: {tag_names}")

        # 步骤2：AI分析用户意图，选出相关标签
        if progress_callback:
            progress_callback("🤖 AI正在分析您的搜索意图...")

        print(f"[步骤2] AI分析用户意图: '{user_query}'")
        selected_tags = _select_relevant_tags(user_query, tag_names)
        print(f"AI选择的相关标签: {selected_tags}")

        if not selected_tags:
            if progress_callback:
                progress_callback(
                    "⚠️ 未找到与您的搜索相关的标签，请尝试使用不同的关键词"
                )
            print("AI未找到相关标签")
            return []

        if progress_callback:
            progress_callback(f"🏷️ 找到相关标签：{', '.join(selected_tags)}")

        # 步骤3：获取选中标签下的所有资源标题和ID
        if progress_callback:
            progress_callback("📚 正在搜索相关资源...")

        print(f"[步骤3] 获取标签下的资源...")
        resource_candidates = []
        resource_cache = {}  # 缓存资源对象，避免步骤5重复查询

        for tag_name in selected_tags:
            # 获取该标签下的资源
            try:
                resources_data, total_count = resource_crud.get_resources_by_tag(
                    db,
                    user_id,
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
            if progress_callback:
                progress_callback("⚠️ 在相关标签下未找到任何资源")
            print("所选标签下无资源")
            return []

        if progress_callback:
            progress_callback(
                f"📊 找到 {len(resource_candidates)} 个候选资源，AI正在筛选最匹配的资源..."
            )

        # 步骤4：AI从资源列表中选出匹配的资源ID
        print(f"[步骤4] AI从 {len(resource_candidates)} 个候选资源中选择匹配项")
        selected_resource_ids = _select_matching_resources(
            user_query, resource_candidates
        )
        print(f"AI选择的资源ID: {selected_resource_ids}")

        if not selected_resource_ids:
            if progress_callback:
                progress_callback("⚠️ AI未找到与您的需求匹配的资源")
            print("AI未找到匹配的资源")
            return []

        if progress_callback:
            progress_callback(
                f"✨ AI选出了 {len(selected_resource_ids)} 个最匹配的资源"
            )

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
                resource = resource_crud.get_resource_by_id(db, resource_id, user_id)
                if resource:
                    final_results.append(resource)

        print(f"工作流完成，返回 {len(final_results)} 个匹配资源")

        if progress_callback and final_results:
            progress_callback(
                f"✅ 搜索完成！为您找到了 {len(final_results)} 个匹配的资源"
            )

        return final_results

    except Exception as e:
        print(f"工作流执行失败: {str(e)}")
        return []


def _select_relevant_tags(user_query: str, available_tags: List[str]) -> List[str]:
    """
    AI选择与用户查询相关的标签
    """
    if not available_tags:
        return []

    # 设置JSON输出解析器（使用Pydantic模型）
    parser = JsonOutputParser(pydantic_object=TagSelectionOutput)

    # 创建提示模板（使用partial_variables设置format_instructions）
    prompt = ChatPromptTemplate.from_messages(
        [
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
        ]
    ).partial(format_instructions=parser.get_format_instructions())

    # 构建链
    chain = prompt | llm | parser

    try:
        result = chain.invoke(
            {
                "user_query": user_query,
                "available_tags": available_tags,
            }
        )

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


def _select_matching_resources(
    user_query: str, resource_candidates: List[Dict]
) -> List[int]:
    """
    AI从候选资源中选择最匹配用户需求的资源
    """
    if not resource_candidates:
        return []

    # 创建资源列表字符串
    resources_text = "\n".join(
        [f"ID: {r['id']}, 标题: {r['title']}" for r in resource_candidates]
    )

    # 设置JSON输出解析器（使用Pydantic模型）
    parser = JsonOutputParser(pydantic_object=ResourceSelectionOutput)

    # 创建提示模板（使用partial_variables设置format_instructions）
    prompt = ChatPromptTemplate.from_messages(
        [
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
        ]
    ).partial(format_instructions=parser.get_format_instructions())

    # 构建链
    chain = prompt | llm | parser

    try:
        result = chain.invoke(
            {
                "user_query": user_query,
                "resources_text": resources_text,
            }
        )

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
