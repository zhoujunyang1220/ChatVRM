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
import { Introduction } from "@/components/introduction";
import { Menu } from "@/components/menu";
import { GitHubLink } from "@/components/githubLink";
import { Meta } from "@/components/meta";
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [customModels, setCustomModels] = useState<CustomVrmModel[]>([]);
  const [customModelBlobs, setCustomModelBlobs] = useState<Record<string, string>>({});

  const characterName = useMemo(() => {
    const preset = VRM_MODEL_PRESETS.find(m => m.id === selectedVrmModelId);
    if (preset) return preset.name;
    const custom = customModels.find(m => m.id === selectedVrmModelId);
    if (custom) return custom.name;
    return "AI";
  }, [selectedVrmModelId, customModels]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    document.documentElement.setAttribute("data-theme", savedTheme || "dark");

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
  }, []);

  useEffect(() => {
    process.nextTick(() => {
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ systemPrompt, elevenLabsParam, chatLog })
      )
    });
  }, [systemPrompt, elevenLabsParam, chatLog]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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

  const handleSendChat = useCallback(
    async (text: string) => {
      const newMessage = text;
      if (newMessage == null) return;

      setChatProcessing(true);
      const messageLog: Message[] = [
        ...chatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      const messageProcessor = new MessageMiddleOut();
      const nameLine = `Your name is ${characterName}. Always refer to yourself as ${characterName}. Never use a different name.`;
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
    localStorage.setItem('selectedLanguage', languageId);
    localStorage.setItem('selectedVoiceId', preset.recommendedVoiceId);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
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
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
        language={selectedLanguage}
      />
      <Menu
        systemPrompt={systemPrompt}
        chatLog={chatLog}
        assistantMessage={assistantMessage}
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
      <button
        onClick={toggleTheme}
        className="fixed z-10 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface1 hover:bg-surface1-hover border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary transition-all text-lg"
        style={{
          top: `calc(12px + var(--safe-area-top, 0px))`,
          right: `calc(12px + var(--safe-area-right, 0px))`,
        }}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>
    </div>
  );
}
