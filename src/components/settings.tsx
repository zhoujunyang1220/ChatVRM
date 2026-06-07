import React, { useEffect, useRef, useState } from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message } from "@/features/messages/messages";
import { Link } from "./link";
import { RestreamTokens } from "./restreamTokens";
import { VRM_MODEL_PRESETS, CustomVrmModel } from "@/features/constants/vrmModelPresets";
import { LANGUAGE_PRESETS } from "@/features/constants/languagePresets";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type Voice = {
  id: string;
  name: string;
  gender: string;
  accent: string;
  language: string;
};

type Props = {
  systemPrompt: string;
  chatLog: Message[];
  selectedVoiceId: string;
  selectedVrmModelId: string;
  selectedLanguage: string;
  onClickClose: () => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeVrmModel: (modelId: string) => void;
  onChangeLanguage: (languageId: string) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  backgroundImage: string;
  onChangeBackgroundImage: (image: string) => void;
  onVoiceChange: (voiceId: string) => void;
  onRestreamTokensUpdate?: (tokens: { access_token: string; refresh_token: string; } | null) => void;
  onTokensUpdate: (tokens: any) => void;
  onChatMessage: (message: string) => void;
  customModels: CustomVrmModel[];
  onAddCustomModel: (name: string, file: File) => void;
  onRemoveCustomModel: (id: string) => void;
};

export const Settings = ({
  systemPrompt,
  chatLog,
  selectedVoiceId,
  selectedVrmModelId,
  selectedLanguage,
  onClickClose,
  onChangeSystemPrompt,
  onChangeChatLog,
  onChangeVrmModel,
  onChangeLanguage,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  backgroundImage,
  onChangeBackgroundImage,
  onVoiceChange,
  onRestreamTokensUpdate = () => {},
  onTokensUpdate,
  onChatMessage,
  customModels,
  onAddCustomModel,
  onRemoveCustomModel,
}: Props) => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [newModelName, setNewModelName] = useState("");
  const customFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/voices`)
      .then((res) => res.json())
      .then((data) => setVoices(data.voices))
      .catch((err) => console.error("Failed to load voices:", err));
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChangeBackgroundImage(base64String);
        localStorage.setItem("backgroundImage", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    onChangeBackgroundImage("");
    localStorage.removeItem("backgroundImage");
  };

  const handleAddCustomModel = () => {
    customFileInputRef.current?.click();
  };

  const handleCustomFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !newModelName.trim()) return;
    const file = files[0];
    if (!file) return;
    onAddCustomModel(newModelName.trim(), file);
    setNewModelName("");
    event.target.value = "";
  };

  return (
    <div className="fixed z-40 w-full h-full bg-black/60 backdrop-blur-sm" style={{ top: 0, left: 0 }}>
      <div
        className="fixed z-10"
        style={{ top: `calc(16px + var(--safe-area-top, 0px))`, left: `calc(16px + var(--safe-area-left, 0px))` }}
      >
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
        />
      </div>
      <div
        className="h-full overflow-auto"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-safe">
          <div
            className="glass-panel rounded-2xl p-6 sm:p-8 my-safe"
            style={{
              marginTop: `calc(64px + var(--safe-area-top, 0px))`,
              marginBottom: `calc(32px + var(--safe-area-bottom, 0px))`,
            }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6 sm:mb-8 font-M_PLUS_2">Settings</h2>

            {/* Language Selection */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-text-primary mb-3 font-M_PLUS_2">Language</h3>
              <p className="text-sm text-text-secondary mb-3">Choose the language you want the AI to use.</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_PRESETS.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => onChangeLanguage(lang.id)}
                    className={`px-4 py-2 min-h-[44px] rounded-xl border transition-colors text-sm ${
                      selectedLanguage === lang.id
                        ? "bg-primary/20 border-primary text-text-primary"
                        : "bg-surface1 hover:bg-surface1-hover border-white/10 text-text-secondary"
                    }`}
                  >
                    <span className="font-bold">{lang.nativeName}</span>
                    <span className="ml-1.5 opacity-70">{lang.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Voice Selection */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-text-primary mb-3 font-M_PLUS_2">Voice</h3>
              <select
                className="w-full h-11 px-4 rounded-xl bg-surface1 hover:bg-surface1-hover text-text-primary border border-white/10 outline-none transition-colors cursor-pointer"
                onChange={(e) => onVoiceChange(e.target.value)}
                value={selectedVoiceId}
              >
                {voices
                  .filter((v) => !selectedLanguage || v.language === selectedLanguage)
                  .map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </section>

            {/* VRM Model */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-text-primary mb-3 font-M_PLUS_2">Avatar Model</h3>
              <p className="text-sm text-text-secondary mb-3">Choose a visual avatar or upload your own .vrm file.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {VRM_MODEL_PRESETS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => onChangeVrmModel(model.id)}
                    className={`text-left px-3 py-2.5 min-h-[44px] rounded-xl border transition-colors ${
                      selectedVrmModelId === model.id
                        ? "bg-primary/20 border-primary text-text-primary"
                        : "bg-surface1 hover:bg-surface1-hover border-white/10 text-text-secondary"
                    }`}
                  >
                    <div className="font-bold text-sm">{model.name}</div>
                    <div className="text-xs mt-0.5 opacity-70">{model.description}</div>
                  </button>
                ))}
                {customModels.map((model) => (
                  <div key={model.id} className="relative group">
                    <button
                      onClick={() => onChangeVrmModel(model.id)}
                      className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl border transition-colors ${
                        selectedVrmModelId === model.id
                          ? "bg-primary/20 border-primary text-text-primary"
                          : "bg-surface1 hover:bg-surface1-hover border-white/10 text-text-secondary"
                      }`}
                    >
                      <div className="font-bold text-sm">{model.name}</div>
                      <div className="text-xs mt-0.5 opacity-70">Custom</div>
                    </button>
                    <button
                      onClick={() => onRemoveCustomModel(model.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-100 transition-opacity"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-text-secondary mb-1">Model Name</label>
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="Enter a name for your model"
                    className="w-full h-11 px-4 rounded-xl bg-surface1 hover:bg-surface1-hover text-text-primary border border-white/10 outline-none transition-colors text-sm"
                  />
                </div>
                <button
                  onClick={handleAddCustomModel}
                  disabled={!newModelName.trim()}
                  className="h-11 px-4 shrink-0 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary text-text-primary text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add VRM
                </button>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".vrm"
                ref={customFileInputRef}
                onChange={handleCustomFileChange}
              />
            </section>

            {/* System Prompt */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-text-primary font-M_PLUS_2">System Prompt</h3>
                <TextButton onClick={onClickResetSystemPrompt}>Reset</TextButton>
              </div>
              <textarea
                value={systemPrompt}
                onChange={onChangeSystemPrompt}
                className="w-full h-40 px-4 py-3 rounded-xl bg-surface1 hover:bg-surface1-hover text-text-primary border border-white/10 outline-none resize-none transition-colors typography-14"
              />
            </section>

            {/* Background */}
            <section className="mb-8">
              <h3 className="text-lg font-bold text-text-primary mb-3 font-M_PLUS_2">Background</h3>
              <div className="flex flex-col gap-3">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-text-secondary text-sm" />
                {backgroundImage && (
                  <div className="flex items-center gap-4">
                    <img src={backgroundImage} alt="Preview" className="w-24 h-16 object-cover rounded-xl" />
                    <TextButton onClick={handleRemoveBackground}>Remove</TextButton>
                  </div>
                )}
              </div>
            </section>

            <RestreamTokens onTokensUpdate={onTokensUpdate} onChatMessage={onChatMessage} />

            {/* Conversation History */}
            {chatLog.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-text-primary font-M_PLUS_2">Conversation History</h3>
                  <TextButton onClick={onClickResetChatLog}>Clear</TextButton>
                </div>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {chatLog.map((value, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-secondary mt-3 w-16 shrink-0 uppercase">
                        {value.role === "assistant" ? "AI" : "You"}
                      </span>
                      <input
                        className="flex-1 min-w-0 px-4 py-2 rounded-xl bg-surface1 hover:bg-surface1-hover text-text-primary border border-white/5 outline-none transition-colors text-sm"
                        type="text"
                        value={value.content}
                        onChange={(event) => onChangeChatLog(index, event.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
