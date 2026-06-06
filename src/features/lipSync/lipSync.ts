import { LipSyncAnalyzeResult } from "./lipSyncAnalyzeResult";

const TIME_DOMAIN_DATA_LENGTH = 2048;

export class LipSync {
  public audio?: AudioContext;
  public analyser?: AnalyserNode;
  public readonly timeDomainData: Float32Array;

  public constructor(audio?: AudioContext) {
    this.timeDomainData = new Float32Array(TIME_DOMAIN_DATA_LENGTH);
    if (audio) {
      this.initAudio(audio);
    }
  }

  private initAudio(audio: AudioContext) {
    this.audio = audio;
    this.analyser = audio.createAnalyser();
  }

  private ensureAudio(): AudioContext {
    if (!this.audio) {
      const ctx = new AudioContext();
      this.initAudio(ctx);
    }
    return this.audio!;
  }

  public update(): LipSyncAnalyzeResult {
    this.analyser.getFloatTimeDomainData(this.timeDomainData);

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
    if (audio.state === "suspended") {
      await audio.resume();
    }
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
