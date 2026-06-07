import { useState } from "react";

type Props = {
  language: string;
  onStart: () => void;
};

const INTRO_CONTENT: Record<string, { title: string; subtitle: string; steps: string[]; button: string }> = {
  en: {
    title: "English Speaking Coach",
    subtitle: "Practice English conversation with a 3D AI partner. Speak naturally — no tests, no pressure.",
    steps: [
      "Click the microphone and speak in English",
      "Your AI partner responds naturally",
      "Don't worry about mistakes — just keep the conversation flowing",
    ],
    button: "Start",
  },
  zh: {
    title: "英语口语陪练",
    subtitle: "和 3D AI 角色练英语口语。自然开口，没有考试，没有压力。",
    steps: [
      "点击麦克风，用英语说话",
      "AI 伙伴会自然回应你",
      "别担心犯错——让对话自然进行就好",
    ],
    button: "开始",
  },
  ja: {
    title: "英会話コーチ",
    subtitle: "3D AI キャラクターと英会話練習。自然に話すだけでOK — テストもプレッシャーもありません。",
    steps: [
      "マイクをクリックして英語で話す",
      "AI パートナーが自然に返答",
      "間違いを気にせずに、会話を楽しんで",
    ],
    button: "開始",
  },
  ko: {
    title: "영어 회화 코치",
    subtitle: "3D AI 파트너와 영어 회화를 연습하세요. 시험도 부담도 없이 자연스럽게 말해보세요.",
    steps: [
      "마이크를 클릭하고 영어로 말하세요",
      "AI 파트너가 자연스럽게 응답합니다",
      "실수는 걱정하지 마세요 — 대화의 흐름을 이어가세요",
    ],
    button: "시작",
  },
  es: {
    title: "Entrenador de Inglés",
    subtitle: "Practica conversación en inglés con un compañero AI 3D. Habla naturalmente — sin exámenes, sin presión.",
    steps: [
      "Haz clic en el micrófono y habla en inglés",
      "Tu compañero AI responde naturalmente",
      "No te preocupes por los errores — solo mantén la conversación",
    ],
    button: "Comenzar",
  },
  fr: {
    title: "Coach d'Anglais",
    subtitle: "Pratiquez l'anglais avec un partenaire AI 3D. Parlez naturellement — pas de tests, pas de pression.",
    steps: [
      "Cliquez sur le microphone et parlez en anglais",
      "Votre partenaire AI répond naturellement",
      "Ne vous inquiétez pas des erreurs — laissez la conversation couler",
    ],
    button: "Commencer",
  },
  de: {
    title: "Englisch-Sprachtrainer",
    subtitle: "Übe englische Konversation mit einem 3D KI-Partner. Sprich natürlich — keine Tests, kein Druck.",
    steps: [
      "Klicke auf das Mikrofon und sprich Englisch",
      "Dein KI-Partner antwortet natürlich",
      "Mach dir keine Sorgen um Fehler — lass das Gespräch einfach fließen",
    ],
    button: "Start",
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
