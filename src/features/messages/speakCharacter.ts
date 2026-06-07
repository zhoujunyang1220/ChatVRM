import { wait } from "@/utils/wait";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { ElevenLabsParam } from "../constants/elevenLabsParam";

const BACKEND_URL = "/api/";

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

      const buffer = await fetchAudio(screenplay.talk.message, voiceId).catch((err) => {
        console.error('fetchAudio failed:', err, 'voiceId:', voiceId, 'text:', screenplay.talk.message);
        return null;
      });
      if (!buffer) {
        console.warn('Audio buffer is null/empty for voiceId:', voiceId);
      }
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(([audioBuffer]) => {
      onStart?.();
      if (!audioBuffer) {
        return viewer.model?.speak(null, screenplay);
      }
      return viewer.model?.speak(audioBuffer, screenplay);
    });
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
}

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (text: string, voiceId: string = "en-US-JennyNeural"): Promise<ArrayBuffer> => {
  const response = await fetch(`${BACKEND_URL}tts/`, {
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