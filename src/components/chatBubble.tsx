import { motion, AnimatePresence } from "framer-motion";
import { Message } from "@/features/messages/messages";
import { useEffect, useState } from "react";

type Props = {
  messages: Message[];
  characterName: string;
  streamingMessage?: string;
};

const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
};

export const ChatBubble = ({ messages, characterName, streamingMessage }: Props) => {
  const allMessages = messages.length > 0 || (streamingMessage && streamingMessage.trim());

  /* ── track data-theme attribute changes ── */
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setTheme((el.getAttribute("data-theme") as "dark" | "light") || "dark");
    update();
    const obs = new MutationObserver((mut) => {
      if (mut.some((m) => m.attributeName === "data-theme")) update();
    });
    obs.observe(el, { attributes: true });
    return () => obs.disconnect();
  }, []);

  if (!allMessages) return null;

  return (
    <div className="fixed left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none"
      style={{
        bottom: `calc(100px + var(--safe-area-bottom, 0px) + var(--keyboard-offset, 0px))`,
        maxHeight: `calc(50vh - var(--safe-area-top, 0px))`,
      }}
    >
      <div className="mx-auto max-w-lg sm:max-w-2xl space-y-2 overflow-y-auto scroll-hidden flex flex-col-reverse"
        style={{ maxHeight: "100%" }}
      >
        {streamingMessage && streamingMessage.trim() && (
          <Bubble
            key="streaming"
            isUser={false}
            content={streamingMessage}
            characterName={characterName}
            isStreaming={true}
            theme={theme}
          />
        )}

        {[...messages].reverse().map((msg, i) => (
          <Bubble
            key={messages.length - 1 - i}
            isUser={msg.role === "user"}
            content={msg.content}
            characterName={characterName}
            isLatest={i === 0 && !streamingMessage}
            delay={i}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
};

type BubbleProps = {
  isUser: boolean;
  content: string;
  characterName: string;
  isLatest?: boolean;
  isStreaming?: boolean;
  delay?: number;
  theme: "dark" | "light";
};

const Bubble = ({ isUser, content, characterName, isLatest, isStreaming, delay = 0, theme }: BubbleProps) => {
  const cleaned = content.replace(/\[([a-zA-Z]*?)\]/g, "");

  /* pure colors that always contrast with the bubble background */
  const textColor = theme === "dark" ? "#FFFFFF" : "#111111";
  const secondaryColor = theme === "dark" ? "#B0B4C0" : "#6A6A7A";

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.35,
        delay: isLatest ? 0 : 0.04 * delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={`pointer-events-auto ${isUser ? "flex justify-end" : "flex justify-start"}`}
    >
      <div
        className={`
          max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3
          ${isUser
            ? "bg-primary/95 backdrop-blur-md rounded-br-md shadow-xl"
            : "glass-panel rounded-bl-md shadow-xl"
          }
          ${isStreaming ? "border-l-2 border-l-secondary/40" : ""}
        `}
        style={{ color: isUser ? "#FFFFFF" : textColor }}
      >
        {!isUser && (
          <div
            className="text-[11px] font-bold tracking-wider uppercase mb-1.5 font-Montserrat"
            style={{ color: secondaryColor }}
          >
            {characterName}
          </div>
        )}
        <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words font-M_PLUS_2 font-bold">
          {cleaned}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block ml-0.5 w-1.5 h-4 bg-primary/80 rounded-sm align-text-bottom"
            />
          )}
        </div>
        <div
          className={`text-[11px] mt-1.5 ${isUser ? "text-right" : "text-left"} font-Montserrat`}
          style={{ color: secondaryColor }}
        >
          {isUser ? "You" : "AI"}
        </div>
      </div>
    </motion.div>
  );
};
