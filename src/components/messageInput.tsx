import { useRef, useCallback, useState } from "react";
import { IconButton } from "./iconButton";

type Props = {
  userMessage: string;
  isMicRecording: boolean;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onKeyDownUserMessage: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onClickSendButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClickMicButton: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const MessageInput = ({
  userMessage,
  isMicRecording,
  isChatProcessing,
  onChangeUserMessage,
  onKeyDownUserMessage,
  onClickSendButton,
  onClickMicButton,
}: Props) => {
  const inputRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    inputRef.current?.style.setProperty('--mouse-x', `${x}%`);
    inputRef.current?.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  return (
    <div className="absolute bottom-0 z-20 w-screen">
      <div className="mx-auto max-w-4xl px-2 sm:px-4 pb-2 sm:pb-4">
        <div
          ref={inputRef}
          className="glow-container glass-panel rounded-xl sm:rounded-2xl overflow-hidden"
          onMouseMove={handleMouseMove}
        >
          <div className="relative z-10 flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
            <IconButton
              iconName="24/Microphone"
              isProcessing={isMicRecording}
              disabled={isChatProcessing}
              onClick={onClickMicButton}
              className={isMicRecording ? "!bg-secondary" : ""}
            />
            <input
              type="text"
              placeholder="Type a message or use the microphone..."
              onChange={onChangeUserMessage}
              onKeyDown={onKeyDownUserMessage}
              disabled={isChatProcessing}
              className="flex-1 bg-transparent text-text-primary typography-16 font-M_PLUS_2 placeholder-text-secondary outline-none border-none"
              value={userMessage}
            />
            <IconButton
              iconName="24/Send"
              isProcessing={isChatProcessing}
              disabled={isChatProcessing || !userMessage}
              onClick={onClickSendButton}
            />
          </div>
        </div>
      </div>
      <div className="py-3 bg-transparent text-center text-text-secondary text-xs font-Montserrat tracking-wider">
        powered by DeepSeek &middot; three-vrm &middot; VRoid
      </div>
    </div>
  );
};
