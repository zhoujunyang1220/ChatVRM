import { MessageInput } from "@/components/messageInput";
import { useState, useEffect, useCallback, useRef } from "react";
import { initAudioContext } from "@/features/lipSync/lipSync";

type Props = {
  isChatProcessing: boolean;
  onChatProcessStart: (text: string) => void;
  language?: string;
};

export const MessageInputContainer = ({
  isChatProcessing,
  onChatProcessStart,
  language = "en-US",
}: Props) => {
  const [userMessage, setUserMessage] = useState("");
  const [speechRecognition, setSpeechRecognition] =
    useState<SpeechRecognition>();
  const [isMicRecording, setIsMicRecording] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [hasMicSupport, setHasMicSupport] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMicSupport(!!(window.webkitSpeechRecognition || window.SpeechRecognition));
  }, []);

  // Handle mobile virtual keyboard via visualViewport API
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    let initialHeight = window.innerHeight;

    const handleResize = () => {
      const viewportHeight = visualViewport.height;
      const diff = initialHeight - viewportHeight;
      // Only react to significant changes (keyboard open/close)
      if (diff > 100) {
        setKeyboardHeight(diff);
        document.documentElement.style.setProperty('--keyboard-offset', `${diff}px`);
      } else {
        setKeyboardHeight(0);
        document.documentElement.style.setProperty('--keyboard-offset', '0px');
      }
    };

    // Re-calibrate on orientation change
    const handleOrientation = () => {
      setTimeout(() => {
        initialHeight = window.innerHeight;
      }, 300);
    };

    visualViewport.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientation);
    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  const handleRecognitionResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setUserMessage(text);

      if (event.results[0].isFinal) {
        setUserMessage(text);
        onChatProcessStart(text);
      }
    },
    [onChatProcessStart]
  );

  const handleRecognitionEnd = useCallback(() => {
    setIsMicRecording(false);
  }, []);

  const handleClickMicButton = useCallback(() => {
    if (!hasMicSupport) return;

    initAudioContext(); // Must be called from user gesture on mobile

    if (isMicRecording) {
      speechRecognition?.abort();
      setIsMicRecording(false);
      return;
    }

    // Request microphone permission explicitly on mobile
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          speechRecognition?.start();
          setIsMicRecording(true);
        })
        .catch((err) => {
          console.warn("Microphone permission denied:", err);
        });
    } else {
      speechRecognition?.start();
      setIsMicRecording(true);
    }
  }, [isMicRecording, speechRecognition, hasMicSupport]);

  const handleClickSendButton = useCallback(() => {
    initAudioContext(); // Must be called from user gesture on mobile
    onChatProcessStart(userMessage);
  }, [onChatProcessStart, userMessage]);

  useEffect(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const langMap: Record<string, string> = {
      en: "en-US",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
    };

    const recognition = new SpeechRecognition();
    recognition.lang = langMap[language] || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.addEventListener("result", handleRecognitionResult);
    recognition.addEventListener("end", handleRecognitionEnd);

    setSpeechRecognition(recognition);
  }, [handleRecognitionResult, handleRecognitionEnd, language]);

  useEffect(() => {
    if (!isChatProcessing) {
      setUserMessage("");
    }
  }, [isChatProcessing]);

  return (
    <div ref={containerRef}>
      <MessageInput
        userMessage={userMessage}
        isChatProcessing={isChatProcessing}
        isMicRecording={isMicRecording}
        hasMicSupport={hasMicSupport}
        keyboardHeight={keyboardHeight}
        onKeyDownUserMessage={(e) => {
          if (e.key === "Enter") {
            initAudioContext();
            handleClickSendButton();
          }
        }}
        onChangeUserMessage={(e) => setUserMessage(e.target.value)}
        onClickMicButton={handleClickMicButton}
        onClickSendButton={handleClickSendButton}
      />
    </div>
  );
};
