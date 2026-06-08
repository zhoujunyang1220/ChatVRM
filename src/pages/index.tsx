import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { SYSTEM_PROMPT } from "@/features/constants/systemPromptConstants";
import { VRM_MODEL_PRESETS, CustomVrmModel } from "@/features/constants/vrmModelPresets";
import { LANGUAGE_PRESETS } from "@/features/constants/languagePresets";
import { KoeiroParam, DEFAULT_KOEIRO_PARAM } from "@/features/constants/koeiroParam";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { M_PLUS_2, Montserrat } from "next/font/google";
import { ChatBubble } from "@/components/chatBubble";
import { TypingIndicator } from "@/components/typingIndicator";
import { AnimatePresence } from "framer-motion";
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";
import { ThemeToggle } from "@/components/themeToggle";
import { ElevenLabsParam, DEFAULT_ELEVEN_LABS_PARAM } from "@/features/constants/elevenLabsParam";
import { buildUrl } from "@/utils/buildUrl";
import { websocketService } from '../services/websocketService';
import { MessageMiddleOut } from "@/features/messages/messageMiddleOut";

const m_plus_2 = M_PLUS_2({
  variable: "--font-m-plus-2",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  display: "swap",
  subsets: ["latin"],
});

type LLMCallbackResult = {
  processed: boolean;
  error?: string;
};

export default function Home() {
  const { viewer } = useContext(ViewerContext);

  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [selectedVrmModelId, setSelectedVrmModelId] = useState("default");
  const [elevenLabsParam, setElevenLabsParam] = useState<ElevenLabsParam>(DEFAULT_ELEVEN_LABS_PARAM);
  const [selectedVoiceId, setSelectedVoiceId] = useState("en-US-JennyNeural");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [restreamTokens, setRestreamTokens] = useState<any>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [customModels, setCustomModels] = useState<CustomVrmModel[]>([]);
  const [customModelBlobs, setCustomModelBlobs] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ── lamp state (replaces old theme toggle) ── */
  const [lampOn, setLampOn] = useState(true);   // starts ON (dark mode needs light)
  const [shadeHue, setShadeHue] = useState(42);
  const theme: "dark" | "light" = lampOn ? "dark" : "light";

  const characterName = useMemo(() => {
    const preset = VRM_MODEL_PRESETS.find(m => m.id === selectedVrmModelId);
    if (preset) return preset.name;
    const custom = customModels.find(m => m.id === selectedVrmModelId);
    if (custom) return custom.name;
    return "AI";
  }, [selectedVrmModelId, customModels]);

  const speechRecognitionLang = useMemo(() => {
    const preset = LANGUAGE_PRESETS.find(l => l.id === selectedLanguage);
    return preset?.speechRecognitionLang || "en-US";
  }, [selectedLanguage]);

  useEffect(() => {
    const savedLampOn = localStorage.getItem("lampOn");
    setLampOn(savedLampOn !== "false"); // default true (dark mode)
    document.documentElement.setAttribute("data-theme", savedLampOn !== "false" ? "dark" : "light");

    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      setSystemPrompt(params.systemPrompt);
      setElevenLabsParam(params.elevenLabsParam);
      const oldLog: Message[] = params.chatLog || [];
      const hasOldName = oldLog.some(
        (m: Message) => m.role === "assistant" && /moki/i.test(m.content)
      );
      setChatLog(hasOldName ? [] : oldLog);
    }
    const savedVoice = localStorage.getItem('selectedVoiceId');
    if (savedVoice) {
      setSelectedVoiceId(savedVoice);
    }
    const savedBackground = localStorage.getItem('backgroundImage');
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
    const savedVrmModel = localStorage.getItem('selectedVrmModelId');
    if (savedVrmModel) {
      setSelectedVrmModelId(savedVrmModel);
    }
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }

    const savedCustomModels = localStorage.getItem('customVrmModels');
    if (savedCustomModels) {
      setCustomModels(JSON.parse(savedCustomModels));
    }

    // Pre-warm backend to reduce cold start delay
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: '' }] }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    process.nextTick(() => {
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ systemPrompt, elevenLabsParam, chatLog })
      )
    });
  }, [systemPrompt, elevenLabsParam, chatLog]);

  /* sync theme + CSS variables with lamp state */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lampOn", String(lampOn));
  }, [theme, lampOn]);

  useEffect(() => {
    document.documentElement.style.setProperty("--on", lampOn ? "1" : "0");
    document.documentElement.style.setProperty("--shade-hue", String(shadeHue));
  }, [lampOn, shadeHue]);

  useEffect(() => {
    if (backgroundImage) {
      document.body.style.setProperty("--bg-image", `url(${backgroundImage})`);
    } else {
      document.body.style.removeProperty("--bg-image");
    }
  }, [backgroundImage]);

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });
      setChatLog(newChatLog);
    },
    [chatLog]
  );

  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      voiceId: string,
      onStart?: () => void,
      onEnd?: () => void
    ) => {
      setIsAISpeaking(true);
      try {
        await speakCharacter(
          screenplay,
          "",
          elevenLabsParam,
          viewer,
          voiceId,
          () => {
            setIsPlayingAudio(true);
            onStart?.();
          },
          () => {
            setIsPlayingAudio(false);
            onEnd?.();
          }
        );
      } catch (error) {
        console.error('Error during AI speech:', error);
      } finally {
        setIsAISpeaking(false);
      }
    },
    [viewer, elevenLabsParam]
  );

  const getNameInstruction = (name: string, lang: string): string => {
    const map: Record<string, string> = {
      en: `Your name is ${name}. Always refer to yourself as ${name}. Never use a different name.`,
      zh: `你的名字是${name}。始终自称${name}。不要使用其他名字。`,
      ja: `あなたの名前は${name}です。常に自分を${name}と呼んでください。他の名前は使わないでください。`,
      ko: `당신의 이름은 ${name}입니다. 항상 자신을 ${name}이라고 부르세요. 다른 이름을 사용하지 마세요.`,
      es: `Tu nombre es ${name}. Siempre refiérete a ti mismo como ${name}. Nunca uses un nombre diferente.`,
      fr: `Ton nom est ${name}. Réfère-toi toujours à toi-même comme ${name}. N'utilise jamais un autre nom.`,
      de: `Dein Name ist ${name}. Bezeichne dich immer als ${name}. Verwende niemals einen anderen Namen.`,
    };
    return map[lang] || map.en;
  };

  const handleSendChat = useCallback(
    async (text: string) => {
      const newMessage = text;
      if (newMessage == null) return;

      setErrorMessage(null);
      setChatProcessing(true);
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      const messageProcessor = new MessageMiddleOut();
      const nameLine = getNameInstruction(characterName, selectedLanguage);
      const enhancedPrompt = `${nameLine}\n\n${systemPrompt}`;
      const processedMessages = messageProcessor.process([
        { role: "system", content: enhancedPrompt },
        ...messageLog,
      ]);

      const stream = await getChatResponseStream(processedMessages, "", "").catch(
        (e) => {
          console.error(e);
          return null;
        }
      );
      if (stream == null) {
        setChatProcessing(false);
        setErrorMessage("Connection failed. Please check your network and try again.");
        return;
      }

      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);
          }

          // Show accumulated text immediately for fast visual feedback
          setAssistantMessage((sentences.join(" ") + " " + receivedMessage).trim());

          const sentenceMatch = receivedMessage.match(
            /^(.+[。．！？\n.!?]|.{10,}[、,])/
          );
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            if (
              !sentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                ""
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText], DEFAULT_KOEIRO_PARAM);
            aiTextLog += aiText;

            const currentAssistantMessage = sentences.join(" ");
            handleSpeakAi(aiTalks[0], selectedVoiceId, () => {
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        setErrorMessage("AI response interrupted. Please try again.");
        console.error(e);
      } finally {
        reader.releaseLock();
      }

      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [systemPrompt, chatLog, handleSpeakAi, selectedVoiceId]
  );

  const handleTokensUpdate = useCallback((tokens: any) => {
    setRestreamTokens(tokens);
  }, []);

  const handleVoiceChange = useCallback((voiceId: string) => {
    setSelectedVoiceId(voiceId);
    localStorage.setItem('selectedVoiceId', voiceId);
  }, []);

  const handleAddCustomModel = useCallback((name: string, file: File) => {
    const id = `custom_${Date.now()}`;
    const blob = new Blob([file], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const newModel: CustomVrmModel = { id, name };
    const updated = [...customModels, newModel];
    setCustomModels(updated);
    setCustomModelBlobs((prev) => ({ ...prev, [id]: url }));
    localStorage.setItem("customVrmModels", JSON.stringify(updated));
    setSelectedVrmModelId(id);
    localStorage.setItem("selectedVrmModelId", id);
    viewer.loadVrm(url);
  }, [customModels, viewer]);

  const handleRemoveCustomModel = useCallback((id: string) => {
    const updated = customModels.filter((m) => m.id !== id);
    setCustomModels(updated);
    localStorage.setItem("customVrmModels", JSON.stringify(updated));
    setCustomModelBlobs((prev) => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
    if (id === selectedVrmModelId) {
      const defaultId = "default";
      setSelectedVrmModelId(defaultId);
      localStorage.setItem("selectedVrmModelId", defaultId);
      viewer.loadVrm(buildUrl("/avatar_sample.vrm"));
    }
  }, [customModels, selectedVrmModelId, viewer]);

  const handleChangeVrmModel = useCallback((modelId: string) => {
    const preset = VRM_MODEL_PRESETS.find((m) => m.id === modelId);
    if (preset) {
      setSelectedVrmModelId(modelId);
      localStorage.setItem('selectedVrmModelId', modelId);
      viewer.loadVrm(buildUrl(`/${preset.fileName}`));
      return;
    }
    const blobUrl = customModelBlobs[modelId];
    if (blobUrl) {
      setSelectedVrmModelId(modelId);
      localStorage.setItem('selectedVrmModelId', modelId);
      viewer.loadVrm(blobUrl);
    }
  }, [viewer, customModelBlobs]);

  const handleChangeLanguage = useCallback((languageId: string) => {
    const preset = LANGUAGE_PRESETS.find((l) => l.id === languageId);
    if (!preset) return;
    setSelectedLanguage(languageId);
    setSelectedVoiceId(preset.recommendedVoiceId);
    setSystemPrompt(preset.systemPrompt);
    setChatLog([]); // clear history so AI doesn't get confused by old language
    localStorage.setItem('selectedLanguage', languageId);
    localStorage.setItem('selectedVoiceId', preset.recommendedVoiceId);
  }, []);

  const handleLampToggle = useCallback(() => {
    setLampOn((prev) => !prev);
    setShadeHue(Math.floor(Math.random() * 360));
  }, []);

  useEffect(() => {
    websocketService.setLLMCallback(async (message: string): Promise<LLMCallbackResult> => {
      try {
        if (isAISpeaking || isPlayingAudio || chatProcessing) {
          return {
            processed: false,
            error: 'System is busy processing previous message'
          };
        }
        await handleSendChat(message);
        return { processed: true };
      } catch (error) {
        console.error('Error processing message:', error);
        return {
          processed: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    });
  }, [handleSendChat, chatProcessing, isPlayingAudio, isAISpeaking]);

  return (
    <div className={`${m_plus_2.variable} ${montserrat.variable} w-screen h-screen relative overflow-hidden`}>
      <Meta />
      <Introduction language={selectedLanguage} onStart={() => {}} />
      <div className="ambient-gradient" />
      <VrmViewer />

      <ChatBubble
        messages={chatLog}
        characterName={characterName}
        streamingMessage={chatProcessing ? assistantMessage : undefined}
      />

      <AnimatePresence>
        {chatProcessing && !assistantMessage && (
          <TypingIndicator characterName={characterName} />
        )}
      </AnimatePresence>

      {errorMessage && (
        <div className="fixed left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-red-500/15 backdrop-blur-md border border-red-500/30 text-red-400 text-sm shadow-lg"
          style={{ bottom: `calc(140px + var(--safe-area-bottom, 0px) + var(--keyboard-offset, 0px))` }}
        >
          <span className="mr-2">⚠</span>
          {errorMessage}
        </div>
      )}

      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
        language={speechRecognitionLang}
      />
      <Menu
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        characterName={characterName}
        selectedVoiceId={selectedVoiceId}
        selectedVrmModelId={selectedVrmModelId}
        selectedLanguage={selectedLanguage}
        onChangeSystemPrompt={setSystemPrompt}
        onChangeChatLog={handleChangeChatLog}
        onChangeVrmModel={handleChangeVrmModel}
        onChangeLanguage={handleChangeLanguage}
        onVoiceChange={handleVoiceChange}
        handleClickResetChatLog={() => setChatLog([])}
        handleClickResetSystemPrompt={() => setSystemPrompt(SYSTEM_PROMPT)}
        backgroundImage={backgroundImage}
        onChangeBackgroundImage={setBackgroundImage}
        onTokensUpdate={handleTokensUpdate}
        onChatMessage={handleSendChat}
        customModels={customModels}
        onAddCustomModel={handleAddCustomModel}
        onRemoveCustomModel={handleRemoveCustomModel}
      />
      <GitHubLink />
      <ThemeToggle isOn={lampOn} onToggle={handleLampToggle} hue={shadeHue} />
    </div>
  );
}
