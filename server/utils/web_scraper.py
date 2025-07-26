from urllib.parse import urlparse

import requests

from errors import BusinessError


def fetch_web_content_to_markdown(url: str) -> str:
    """使用 Jina AI 获取网页内容"""
    # 验证URL格式
    parsed_url = urlparse(url)
    if not parsed_url.scheme or not parsed_url.netloc:
        raise BusinessError("无效的URL格式")

    # 构建 Jina AI 请求URL
    jina_url = f"https://r.jina.ai/{url}"

    # 发送请求到 Jina AI
    response = requests.get(jina_url, timeout=300)

    return response.text
