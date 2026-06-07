import re
import edge_tts

CURATED_VOICES = [
    # English (US)
    {"id": "en-US-JennyNeural", "name": "Jenny (US Female)", "gender": "Female", "accent": "US", "language": "en"},
    {"id": "en-US-AriaNeural", "name": "Aria (US Female)", "gender": "Female", "accent": "US", "language": "en"},
    {"id": "en-US-AnaNeural", "name": "Ana (US Female - Child)", "gender": "Female", "accent": "US", "language": "en"},
    {"id": "en-US-GuyNeural", "name": "Guy (US Male)", "gender": "Male", "accent": "US", "language": "en"},
    {"id": "en-US-ChristopherNeural", "name": "Christopher (US Male)", "gender": "Male", "accent": "US", "language": "en"},
    {"id": "en-US-EricNeural", "name": "Eric (US Male)", "gender": "Male", "accent": "US", "language": "en"},
    # English (UK)
    {"id": "en-GB-SoniaNeural", "name": "Sonia (UK Female)", "gender": "Female", "accent": "UK", "language": "en"},
    {"id": "en-GB-RyanNeural", "name": "Ryan (UK Male)", "gender": "Male", "accent": "UK", "language": "en"},
    {"id": "en-GB-LibbyNeural", "name": "Libby (UK Female)", "gender": "Female", "accent": "UK", "language": "en"},
    {"id": "en-GB-ThomasNeural", "name": "Thomas (UK Male)", "gender": "Male", "accent": "UK", "language": "en"},
    # English (Australia)
    {"id": "en-AU-NatashaNeural", "name": "Natasha (AU Female)", "gender": "Female", "accent": "AU", "language": "en"},
    {"id": "en-AU-WilliamNeural", "name": "William (AU Male)", "gender": "Male", "accent": "AU", "language": "en"},
    # Chinese (Simplified)
    {"id": "zh-CN-XiaoxiaoNeural", "name": "Xiaoxiao (中文 女)", "gender": "Female", "accent": "CN", "language": "zh"},
    {"id": "zh-CN-YunxiNeural", "name": "Yunxi (中文 男)", "gender": "Male", "accent": "CN", "language": "zh"},
    {"id": "zh-CN-XiaoyiNeural", "name": "Xiaoyi (中文 女 活泼)", "gender": "Female", "accent": "CN", "language": "zh"},
    # Japanese
    {"id": "ja-JP-NanamiNeural", "name": "Nanami (日本語 女性)", "gender": "Female", "accent": "JP", "language": "ja"},
    {"id": "ja-JP-KeitaNeural", "name": "Keita (日本語 男性)", "gender": "Male", "accent": "JP", "language": "ja"},
    # Korean
    {"id": "ko-KR-SunHiNeural", "name": "Sun-Hi (한국어 여성)", "gender": "Female", "accent": "KR", "language": "ko"},
    {"id": "ko-KR-InJoonNeural", "name": "InJoon (한국어 남성)", "gender": "Male", "accent": "KR", "language": "ko"},
    # Spanish
    {"id": "es-ES-ElviraNeural", "name": "Elvira (Español Femenino)", "gender": "Female", "accent": "ES", "language": "es"},
    {"id": "es-ES-AlvaroNeural", "name": "Alvaro (Español Masculino)", "gender": "Male", "accent": "ES", "language": "es"},
    # French
    {"id": "fr-FR-DeniseNeural", "name": "Denise (Français Féminin)", "gender": "Female", "accent": "FR", "language": "fr"},
    {"id": "fr-FR-HenriNeural", "name": "Henri (Français Masculin)", "gender": "Male", "accent": "FR", "language": "fr"},
    # German
    {"id": "de-DE-KatjaNeural", "name": "Katja (Deutsch Weiblich)", "gender": "Female", "accent": "DE", "language": "de"},
    {"id": "de-DE-ConradNeural", "name": "Conrad (Deutsch Männlich)", "gender": "Male", "accent": "DE", "language": "de"},
]


def clean_text_for_tts(text: str) -> str:
    """Remove emoji, markdown, special chars that edge-tts would read aloud."""
    # Remove emoji (using precise Unicode ranges, NOT overlapping with CJK)
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002600-\U000027BF"  # misc symbols + dingbats (exact range)
        "\U0000FE00-\U0000FE0F"  # variation selectors
        "\U0001F900-\U0001F9FF"  # supplemental symbols
        "\U0001FA00-\U0001FA6F"  # chess symbols
        "\U0001FA70-\U0001FAFF"  # symbols extended-A
        "]+",
        flags=re.UNICODE,
    )
    text = emoji_pattern.sub("", text)

    # Remove markdown formatting
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)  # **bold**
    text = re.sub(r"\*(.*?)\*", r"\1", text)  # *italic*
    text = re.sub(r"`(.*?)`", r"\1", text)  # `code`

    # Remove tags like [neutral], [happy] etc.
    text = re.sub(r"\[.*?\]", "", text)

    return text.strip()


async def text_to_speech(text: str, voice_id: str = "en-US-JennyNeural") -> bytes:
    """Convert text to speech audio bytes using edge-tts.

    Args:
        text: The text to speak.
        voice_id: Edge TTS voice identifier.

    Returns:
        WAV audio bytes.
    """
    cleaned = clean_text_for_tts(text)
    communicate = edge_tts.Communicate(cleaned, voice_id)
    audio_bytes = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes += chunk["data"]
    return audio_bytes
