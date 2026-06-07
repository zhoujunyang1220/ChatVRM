import { useState } from "react";

export const Introduction = () => {
  const [opened, setOpened] = useState(true);

  return opened ? (
    <div className="absolute z-40 w-full h-full bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-text-primary mb-2 font-M_PLUS_2">ChatVRM - 3D虚拟角色对话</h1>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          与逼真的3D虚拟角色进行实时对话练习。支持语音识别、口型同步和表情动画，带来沉浸式的对话体验。
        </p>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
            <p className="text-text-secondary text-sm">点击麦克风按钮进行语音输入，或直接在输入框中输入文字</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
            <p className="text-text-secondary text-sm">AI角色将以语音和丰富的表情动作回应你的对话</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
            <p className="text-text-secondary text-sm">支持自定义VRM模型、语音设置和角色性格，打造专属对话伙伴</p>
          </div>
        </div>
        <button
          onClick={() => setOpened(false)}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-press text-white font-bold transition-colors"
        >
          开始对话
        </button>
      </div>
    </div>
  ) : null;
};
