from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from config import settings

# AI 客户端实例
llm = ChatOpenAI(
    base_url=settings.AI_BASE_URL,
    api_key=settings.AI_API_KEY,
    model=settings.AI_MODEL,
)


class ResourceSummary(BaseModel):
    """AI 生成的资源摘要模型"""

    title: str = Field(..., description="资源标题")
    tags: list[str] = Field(..., description="资源标签")
    digest: str = Field(..., description="资源摘要")


def generate_resource_summary(
    web_content: str, user_note: str = "", user_tags: list[str] = None
) -> ResourceSummary:
    """
    使用 AI 根据网页内容和用户备注生成资源摘要

    Args:
        web_content: 网页内容
        user_note: 用户备注
        user_tags: 用户已有的标签列表

    Returns:
        ResourceSummary: 包含标题、标签和摘要的资源摘要
    """
    if user_tags is None:
        user_tags = []

    parser = PydanticOutputParser(pydantic_object=ResourceSummary)

    # 构建标签参考信息
    tags_reference = ""
    if user_tags:
        tags_reference = f"\n<用户已有标签>{', '.join(user_tags)}</用户已有标签>"

    prompt = ChatPromptTemplate.from_messages(
        [
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
        ]
    )

    prompt_and_llm = prompt | llm
    output = prompt_and_llm.invoke(
        {
            "web_content": web_content,
            "user_note": user_note,
            "tags_reference": tags_reference,
        }
    )
    result = parser.invoke(output)

    return result
