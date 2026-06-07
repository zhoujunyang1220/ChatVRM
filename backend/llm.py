import json
import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"), override=True)

API_KEY = os.getenv("AGNES_API_KEY")
API_BASE = os.getenv("AGNES_API_BASE", "https://apihub.agnes-ai.com")

if not API_KEY:
    raise ValueError("AGNES_API_KEY not found in .env")


def chat_stream(messages: list[dict]) -> requests.Response:
    url = f"{API_BASE}/v1/chat/completions"

    payload = {
        "model": "agnes-2.0-flash",
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
