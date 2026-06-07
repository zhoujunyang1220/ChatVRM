import json
import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"), override=True)

API_KEY = os.getenv("DEEPSEEK_API_KEY")
API_BASE = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com")

if not API_KEY:
    raise ValueError("DEEPSEEK_API_KEY not found in .env")


def chat_stream(messages: list[dict]) -> requests.Response:
    """Call DeepSeek API with streaming.

    Args:
        messages: Full message list including system prompt.

    Returns:
        A requests.Response with streaming enabled (SSE format).
    """
    url = f"{API_BASE}/chat/completions"

    payload = {
        "model": "agnes",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 500,
        "stream": True,
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    response = requests.post(
        url,
        json=payload,
        headers=headers,
        stream=True,
        timeout=60,
    )

    response.raise_for_status()
    return response


def parse_stream_line(line: str) -> str | None:
    """Parse a single SSE line from DeepSeek API response.

    Returns the content delta string, or None if the line contains no content.
    """
    line = line.strip()
    if not line.startswith("data:"):
        return None

    json_str = line[5:].strip()

    if json_str == "[DONE]":
        return None

    try:
        data = json.loads(json_str)
        delta = data.get("choices", [{}])[0].get("delta", {})
        content = delta.get("content")
        return content
    except (json.JSONDecodeError, KeyError, IndexError):
        return None
