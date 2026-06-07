import { LipSyncAnalyzeResult } from "./lipSyncAnalyzeResult";

const TIME_DOMAIN_DATA_LENGTH = 2048;

// Shared AudioContext singleton — created on first user gesture
let _sharedAudioContext: AudioContext | null = null;

export function initAudioContext() {
  if (!_sharedAudioContext || _sharedAudioContext.state === 'closed') {
    _sharedAudioContext = new AudioContext();
  }
  if (_sharedAudioContext.state === 'suspended') {
    _sharedAudioContext.resume().catch((e) => {
      console.warn('LipSync: AudioContext resume failed:', e);
    });
  }
  return _sharedAudioContext;
}

export function getAudioContext(): AudioContext {
  if (!_sharedAudioContext || _sharedAudioContext.state === 'closed') {
    _sharedAudioContext = new AudioContext();
  }
  return _sharedAudioContext;
}

export class LipSync {
  public audio?: AudioContext;
  public analyser?: AnalyserNode;
  public readonly timeDomainData: Float32Array;

  public constructor() {
    this.timeDomainData = new Float32Array(TIME_DOMAIN_DATA_LENGTH);
  }

  private initAudio(audio: AudioContext) {
    this.audio = audio;
    this.analyser = audio.createAnalyser();
  }

  private ensureAudio(): AudioContext {
    const ctx = getAudioContext();
    if (!this.audio) {
      this.initAudio(ctx);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch((e) => {
        console.warn('LipSync: resume failed:', e);
      });
    }
    return ctx;
  }

  public update(): LipSyncAnalyzeResult {
    this.ensureAudio();
    this.analyser!.getFloatTimeDomainData(this.timeDomainData);

    let volume = 0.0;
    for (let i = 0; i < TIME_DOMAIN_DATA_LENGTH; i++) {
      volume = Math.max(volume, Math.abs(this.timeDomainData[i]));
    }

    // cook
    volume = 1 / (1 + Math.exp(-45 * volume + 5));
    if (volume < 0.1) volume = 0;

    return {
      volume,
    };
  }

  public async playFromArrayBuffer(buffer: ArrayBuffer, onEnded?: () => void) {
    const audio = this.ensureAudio();
    const audioBuffer = await audio.decodeAudioData(buffer);

    const bufferSource = audio.createBufferSource();
    bufferSource.buffer = audioBuffer;

    bufferSource.connect(audio.destination);
    bufferSource.connect(this.analyser!);
    bufferSource.start();
    if (onEnded) {
      bufferSource.addEventListener("ended", onEnded);
    }
  }

  public async playFromURL(url: string, onEnded?: () => void) {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    this.playFromArrayBuffer(buffer, onEnded);
  }
}
