import json
import os
import sys
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel

# Add backend dir to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from llm import chat_stream, parse_stream_line
from tts import text_to_speech, CURATED_VOICES

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"), override=True)

app = FastAPI(title="English Coach Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request Models ────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class TTSRequest(BaseModel):
    text: str
    voice_id: str = "en-US-JennyNeural"


# ─── Endpoints ─────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/voices")
async def get_voices():
    return {"voices": CURATED_VOICES}


@app.post("/chat")
async def chat(request: ChatRequest):
    """Streaming chat endpoint. Returns SSE stream of text chunks."""
    # Use messages as-is from frontend (already includes language-specific system prompt)
    messages = [m.dict() for m in request.messages]

    async def event_stream():
        try:
            response = chat_stream(messages)
            for line in response.iter_lines(decode_unicode=True):
                if not line:
                    continue
                content = parse_stream_line(line)
                if content:
                    yield f"data: {json.dumps({'type': 'chunk', 'content': content})}\n\n"

            yield f"data: {json.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/tts")
async def tts(request: TTSRequest):
    """Convert text to speech audio."""
    try:
        audio_bytes = await text_to_speech(request.text, request.voice_id)
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "Content-Disposition": f'attachment; filename="speech.wav"',
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Entry ─────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting English Coach Backend on http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
