import { motion } from "framer-motion";
import { IconButton } from "./iconButton";

type Props = {
  userMessage: string;
  isMicRecording: boolean;
  isChatProcessing: boolean;
  hasMicSupport: boolean;
  keyboardHeight: number;
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
  hasMicSupport,
  keyboardHeight,
  onChangeUserMessage,
  onKeyDownUserMessage,
  onClickSendButton,
  onClickMicButton,
}: Props) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed bottom-0 z-30 w-screen"
      style={{
        paddingBottom: `calc(var(--safe-area-bottom, 0px) + ${keyboardHeight}px)`,
        transition: keyboardHeight > 0 ? 'none' : 'padding-bottom 0.3s ease',
      }}
    >
      <div className="mx-auto max-w-4xl px-2 sm:px-4 pb-2 sm:pb-4">
        <motion.div
          className="relative rounded-xl sm:rounded-2xl overflow-hidden"
          animate={{
            boxShadow: isMicRecording
              ? [
                  "0 0 0 0 rgba(124, 92, 191, 0)",
                  "0 0 0 8px rgba(124, 92, 191, 0.15)",
                  "0 0 0 16px rgba(124, 92, 191, 0)",
                ]
              : "0 0 0 0 rgba(124, 92, 191, 0)",
          }}
          transition={
            isMicRecording
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        >
          <div className="glow-container glass-panel">
            {/* Recording pulse bar */}
            {isMicRecording && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ backgroundSize: "200% 100%" }}
              />
            )}

            <div className="relative z-10 flex items-center gap-2 sm:gap-3 p-2 sm:p-3">
              {hasMicSupport && (
                <div className="relative">
                  {/* Pulse ring when recording */}
                  {isMicRecording && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.4, 0, 0.4],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        background: "var(--color-primary)",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  <IconButton
                    iconName="24/Microphone"
                    isProcessing={isMicRecording}
                    disabled={isChatProcessing}
                    onClick={onClickMicButton}
                    className={isMicRecording ? "!bg-secondary !ring-2 !ring-secondary/50" : ""}
                  />
                </div>
              )}
              <input
                type="text"
                placeholder="Type a message or use the microphone..."
                onChange={onChangeUserMessage}
                onKeyDown={onKeyDownUserMessage}
                disabled={isChatProcessing}
                className="flex-1 bg-transparent text-text-primary typography-16 font-M_PLUS_2 placeholder-text-secondary outline-none border-none min-h-[44px]"
                value={userMessage}
                autoComplete="off"
                inputMode="text"
              />
              <IconButton
                iconName="24/Send"
                isProcessing={isChatProcessing}
                disabled={isChatProcessing || !userMessage}
                onClick={onClickSendButton}
              />
            </div>
          </div>
        </motion.div>
      </div>
      <div className="py-1 sm:py-3 bg-transparent text-center text-text-secondary/40 text-[10px] sm:text-xs font-Montserrat tracking-wider">
        powered by Agnes &middot; three-vrm &middot; VRoid
      </div>
    </motion.div>
  );
};
