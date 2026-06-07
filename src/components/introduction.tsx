import { useState } from "react";

type Props = {
  language: string;
  onStart: () => void;
};

const INTRO_CONTENT: Record<string, { title: string; subtitle: string; steps: string[]; button: string }> = {
  en: {
    title: "ChatVRM",
    subtitle: "Chat with a 3D AI character in your browser. Speak or type — your AI companion responds naturally with voice and expressions.",
    steps: [
      "Click the microphone and speak, or type a message",
      "Your AI companion responds with voice and expressions",
      "Change avatars, backgrounds, and voice settings anytime",
    ],
    button: "Start Chatting",
  },
  zh: {
    title: "ChatVRM",
    subtitle: "在浏览器中和 3D AI 角色对话。用说的或打的都行，AI 伙伴会用语音和表情自然回应你。",
    steps: [
      "点击麦克风说话，或者输入文字",
      "AI 伙伴会通过语音和表情回应你",
      "随时更换形象、背景和声音设置",
    ],
    button: "开始对话",
  },
  ja: {
    title: "ChatVRM",
    subtitle: "ブラウザで3D AIキャラクターと会話。話しかけたり、文字を入力したり — AIが声と表情で自然に返答します。",
    steps: [
      "マイクで話すか、メッセージを入力",
      "AIキャラクターが声と表情で応答",
      "アバターや背景、音声はいつでも変更可能",
    ],
    button: "会話を始める",
  },
  ko: {
    title: "ChatVRM",
    subtitle: "브라우저에서 3D AI 캐릭터와 대화하세요. 말하거나 글을 입력하면 AI가 음성과 표정으로 자연스럽게 응답합니다.",
    steps: [
      "마이크로 말하거나 메시지를 입력하세요",
      "AI 캐릭터가 음성과 표정으로 응답합니다",
      "아바타, 배경, 음성 설정은 언제든지 변경 가능",
    ],
    button: "대화 시작",
  },
  es: {
    title: "ChatVRM",
    subtitle: "Chatea con un personaje 3D de IA en tu navegador. Habla o escribe — tu compañero IA responde con voz y expresiones.",
    steps: [
      "Habla por el micrófono o escribe un mensaje",
      "Tu compañero IA responde con voz y gestos",
      "Cambia avatares, fondos y voz cuando quieras",
    ],
    button: "Comenzar",
  },
  fr: {
    title: "ChatVRM",
    subtitle: "Discutez avec un personnage 3D IA dans votre navigateur. Parlez ou tapez — votre compagnon IA répond avec voix et expressions.",
    steps: [
      "Parlez au micro ou tapez un message",
      "Votre compagnon IA répond avec voix et expressions",
      "Changez d'avatar, de fond et de voix à tout moment",
    ],
    button: "Commencer",
  },
  de: {
    title: "ChatVRM",
    subtitle: "Chatte mit einem 3D KI-Charakter in deinem Browser. Sprich oder tippe — dein KI-Begleiter antwortet mit Stimme und Ausdrücken.",
    steps: [
      "Spreche ins Mikrofon oder tippe eine Nachricht",
      "Dein KI-Begleiter antwortet mit Stimme und Mimik",
      "Tausche Avatare, Hintergründe und Stimmen aus",
    ],
    button: "Loslegen",
  },
};

export const Introduction = ({ language, onStart }: Props) => {
  const [opened, setOpened] = useState(true);
  const content = INTRO_CONTENT[language] || INTRO_CONTENT.en;

  const handleStart = () => {
    setOpened(false);
    onStart();
  };

  return opened ? (
    <div className="fixed z-50 w-full h-full bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" style={{ top: 0, left: 0 }}>
      <div className="glass-panel rounded-2xl p-8 max-w-lg w-full mx-4">
        <h1 className="text-2xl font-bold text-text-primary mb-2 font-M_PLUS_2">{content.title}</h1>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">
          {content.subtitle}
        </p>
        <div className="space-y-3 mb-6">
          {content.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-text-secondary text-sm">{step}</p>
            </div>
          ))}
        </div>
        <button
          onClick={handleStart}
          className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover active:bg-primary-press text-white font-bold transition-colors"
        >
          {content.button}
        </button>
      </div>
    </div>
  ) : null;
};
