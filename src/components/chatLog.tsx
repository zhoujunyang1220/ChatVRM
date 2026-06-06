import { useEffect, useRef } from "react";
import { Message } from "@/features/messages/messages";
type Props = {
  messages: Message[];
};
export const ChatLog = ({ messages }: Props) => {
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({
      behavior: "auto",
      block: "center",
    });
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [messages]);
  return (
    <div className="absolute w-full h-[100svh] pb-64">
      <div className="max-h-full px-4 pt-24 pb-64 overflow-y-auto scroll-hidden">
        {messages.map((msg, i) => {
          return (
            <div key={i} ref={messages.length - 1 === i ? chatScrollRef : null}>
              <Chat role={msg.role} message={msg.content} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Chat = ({ role, message }: { role: string; message: string }) => {
  const isAssistant = role === "assistant";
  const offsetX = isAssistant ? "pr-16 pl-16" : "pl-16 pr-16";

  return (
    <div className={`mx-auto max-w-lg my-4 ${offsetX}`}>
      <div
        className={`px-4 py-1.5 rounded-t-xl text-xs font-bold tracking-wider font-Montserrat uppercase ${
          isAssistant ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
        }`}
      >
        {isAssistant ? "AI Coach" : "You"}
      </div>
      <div className={`px-5 py-4 rounded-b-xl text-sm leading-relaxed ${
        isAssistant ? "bg-surface1 text-text-primary" : "bg-surface3 text-text-primary"
      }`}>
        {message}
      </div>
    </div>
  );
};
