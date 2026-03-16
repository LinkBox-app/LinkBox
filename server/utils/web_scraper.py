from urllib.parse import urlparse

import requests
from requests import RequestException

from errors import BusinessError


def fetch_web_content_to_markdown(url: str) -> str:
    """使用 Jina AI 获取网页内容"""
    # 验证URL格式
    parsed_url = urlparse(url)
    if not parsed_url.scheme or not parsed_url.netloc:
        raise BusinessError("无效的URL格式")

    # 构建 Jina AI 请求URL
    jina_url = f"https://r.jina.ai/{url}"

    try:
        # 使用更合理的超时设置：(连接超时, 读取超时)
        response = requests.get(jina_url, timeout=(10, 30))
        response.raise_for_status()
    except RequestException as e:
        raise BusinessError(f"抓取网页内容失败: {str(e)}") from e

    if not response.text or not response.text.strip():
        raise BusinessError("抓取网页内容失败: 返回内容为空")

    return response.text
