import { wait } from "@/utils/wait";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { ElevenLabsParam } from "../constants/elevenLabsParam";
import { initAudioContext } from "../lipSync/lipSync";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/**
 * Fallback TTS using browser's built-in SpeechSynthesis API (works offline, no backend needed)
 */
function speakWithBrowserTTS(text: string, onEnd?: () => void): boolean {
  if (!window.speechSynthesis) return false;

  // Clean text of emotion tags
  const cleanText = text.replace(/\[([a-zA-Z]*?)\]/g, "").trim();
  if (!cleanText) return false;

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Try to find a good English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Female"))
    || voices.find(v => v.lang.startsWith("en-US"))
    || voices.find(v => v.lang.startsWith("en"));
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return (
    screenplay: Screenplay,
    _elevenLabsKey: string,
    _elevenLabsParam: ElevenLabsParam,
    viewer: Viewer,
    voiceId: string,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      lastTime = Date.now();

      // First try fetching audio from TTS backend
      try {
        const buffer = await fetchAudio(screenplay.talk.message, voiceId);
        return buffer;
      } catch (err) {
        console.warn('TTS backend fetch failed, trying browser speech:', err);
        return null; // Will trigger fallback
      }
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(([audioBuffer]) => {
      onStart?.();

      if (audioBuffer) {
        // Backend TTS succeeded — use it with lip sync
        return viewer.model?.speak(audioBuffer, screenplay);
      }

      // Backend TTS failed — try browser's built-in TTS as fallback
      const cleanText = screenplay.talk.message.replace(/\[([a-zA-Z]*?)\]/g, "").trim();
      if (cleanText && speakWithBrowserTTS(cleanText, onComplete)) {
        // Browser TTS fallback — character expression only (no lip sync data)
        if (screenplay.expression) {
          viewer.model?.emoteController?.playEmotion(screenplay.expression);
        }
        return;
      }

      // No audio at all — just set expression
      console.warn('No TTS available for:', cleanText);
      return viewer.model?.speak(null, screenplay);
    });
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
}

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (text: string, voiceId: string = "en-US-JennyNeural"): Promise<ArrayBuffer> => {
  // Pre-warm AudioContext (must be called from user gesture chain on mobile)
  initAudioContext();

  const response = await fetch(`${BACKEND_URL}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text,
      voice_id: voiceId,
    }),
  });

  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.status}`);
  }

  return await response.arrayBuffer();
};
