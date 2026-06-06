import { useState } from "react";

export const Introduction = () => {
  const [opened, setOpened] = useState(true);

  return opened ? (
    <div className="absolute z-40 w-full h-full bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-text-primary mb-2 font-M_PLUS_2">English Speaking Coach</h1>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          Practice English conversation with a 3D AI partner. Speak naturally — no tests, no pressure.
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
            <p className="text-text-secondary text-sm">Click the microphone and speak in English</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
            <p className="text-text-secondary text-sm">Your AI partner responds naturally</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
            <p className="text-text-secondary text-sm">Don&apos;t worry about mistakes — just keep the conversation flowing</p>
          </div>
        </div>
        <button
          onClick={() => setOpened(false)}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-press text-white font-bold transition-colors"
        >
          Start
        </button>
      </div>
    </div>
  ) : null;
};
