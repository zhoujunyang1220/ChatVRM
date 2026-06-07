import { IconButton } from "./iconButton";
import { Message } from "@/features/messages/messages";
import { ChatLog } from "./chatLog";
import React, { useCallback, useContext, useRef, useState, useEffect } from "react";
import { Settings } from "./settings";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { AssistantText } from "./assistantText";
import { CustomVrmModel } from "@/features/constants/vrmModelPresets";

type Props = {
  systemPrompt: string;
  chatLog: Message[];
  assistantMessage: string;
  characterName: string;
  selectedVoiceId: string;
  selectedCharacterId: string;
  selectedVrmModelId: string;
  selectedLanguage: string;
  onChangeSystemPrompt: (systemPrompt: string) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeCharacter: (characterId: string) => void;
  onChangeVrmModel: (modelId: string) => void;
  onChangeLanguage: (languageId: string) => void;
  onVoiceChange: (voiceId: string) => void;
  handleClickResetChatLog: () => void;
  handleClickResetSystemPrompt: () => void;
  backgroundImage: string;
  onChangeBackgroundImage: (value: string) => void;
  onChatMessage: (message: string) => void;
  onTokensUpdate: (tokens: any) => void;
  customModels: CustomVrmModel[];
  onAddCustomModel: (name: string, file: File) => void;
  onRemoveCustomModel: (id: string) => void;
};

export const Menu = ({
  systemPrompt,
  chatLog,
  assistantMessage,
  characterName,
  selectedVoiceId,
  selectedCharacterId,
  selectedVrmModelId,
  selectedLanguage,
  onChangeSystemPrompt,
  onChangeChatLog,
  onChangeCharacter,
  onChangeVrmModel,
  onChangeLanguage,
  onVoiceChange,
  handleClickResetChatLog,
  handleClickResetSystemPrompt,
  backgroundImage,
  onChangeBackgroundImage,
  onChatMessage,
  onTokensUpdate,
  customModels,
  onAddCustomModel,
  onRemoveCustomModel,
}: Props) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const { viewer } = useContext(ViewerContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedBackground = localStorage.getItem("backgroundImage");
    if (savedBackground) {
      onChangeBackgroundImage(savedBackground);
    }
  }, [onChangeBackgroundImage]);

  const handleChangeSystemPrompt = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeSystemPrompt(event.target.value);
    },
    [onChangeSystemPrompt]
  );

  const handleClickOpenVrmFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleChangeVrmFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;
      const file = files[0];
      if (!file) return;
      const file_type = file.name.split(".").pop();
      if (file_type === "vrm") {
        const blob = new Blob([file], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        viewer.loadVrm(url);
      }
      event.target.value = "";
    },
    [viewer]
  );

  const handleBackgroundImageChange = (image: string) => {
    onChangeBackgroundImage(image);
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 z-10 p-2 sm:p-6"
        style={{ paddingTop: `calc(8px + var(--safe-area-top, 0px))` }}
      >
        <div className="flex gap-2">
          <IconButton
            iconName="24/Menu"
            label="Settings"
            isProcessing={false}
            onClick={() => setShowSettings(true)}
          />
          <IconButton
            iconName={showChatLog ? "24/CommentOutline" : "24/CommentFill"}
            label="Log"
            isProcessing={false}
            disabled={chatLog.length <= 0}
            onClick={() => setShowChatLog(!showChatLog)}
          />
        </div>
      </div>

      {showChatLog && <ChatLog messages={chatLog} />}

      {showSettings && (
        <Settings
          systemPrompt={systemPrompt}
          chatLog={chatLog}
          selectedVoiceId={selectedVoiceId}
          selectedCharacterId={selectedCharacterId}
          selectedVrmModelId={selectedVrmModelId}
          selectedLanguage={selectedLanguage}
          onClickClose={() => setShowSettings(false)}
          onChangeSystemPrompt={handleChangeSystemPrompt}
          onChangeChatLog={onChangeChatLog}
          onChangeCharacter={onChangeCharacter}
          onChangeVrmModel={onChangeVrmModel}
          onChangeLanguage={onChangeLanguage}
          onClickOpenVrmFile={handleClickOpenVrmFile}
          onClickResetChatLog={handleClickResetChatLog}
          onClickResetSystemPrompt={handleClickResetSystemPrompt}
          backgroundImage={backgroundImage}
          onChangeBackgroundImage={handleBackgroundImageChange}
          onVoiceChange={onVoiceChange}
          onTokensUpdate={onTokensUpdate}
          onChatMessage={onChatMessage}
          customModels={customModels}
          onAddCustomModel={onAddCustomModel}
          onRemoveCustomModel={onRemoveCustomModel}
        />
      )}

      {!showChatLog && assistantMessage && (
        <AssistantText message={assistantMessage} characterName={characterName} />
      )}

      <input
        type="file"
        className="hidden"
        accept=".vrm"
        ref={fileInputRef}
        onChange={handleChangeVrmFile}
      />
    </>
  );
};
