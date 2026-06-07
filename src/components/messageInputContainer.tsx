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
  const [isMicRecording, setIsMicRecording] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [hasMicSupport, setHasMicSupport] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);
  const micActiveRef = useRef(false);        // Whether mic should auto-restart
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null); // Current instance
  const langRef = useRef(language);

  useEffect(() => { isProcessingRef.current = isChatProcessing; }, [isChatProcessing]);
  useEffect(() => { langRef.current = language; }, [language]);

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
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setUserMessage(text);

      if (result.isFinal && text.trim()) {
        if (!isProcessingRef.current) {
          isProcessingRef.current = true;
          onChatProcessStart(text);
        }
      }
    },
    [onChatProcessStart]
  );

  /** Create a fresh SpeechRecognition instance and start listening */
  const startListening = useCallback(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = langRef.current;
    recognition.interimResults = true;
    recognition.continuous = false; // Single utterance — auto-restart in onEnd

    recognition.addEventListener("result", handleRecognitionResult);
    recognition.addEventListener("end", handleRecognitionEnd);

    try {
      recognition.start();
      speechRecognitionRef.current = recognition;
      setIsMicRecording(true);
    } catch (err) {
      console.warn("SpeechRecognition.start failed:", err);
      speechRecognitionRef.current = null;
      setIsMicRecording(false);
    }
  }, [handleRecognitionResult]);
  // Store in ref so handleRecognitionEnd can access it without creating a dep cycle
  const startListeningRef = useRef(startListening);
  startListeningRef.current = startListening;

  const handleRecognitionEnd = useCallback(() => {
    if (micActiveRef.current) {
      // Auto-restart for continuous conversation
      startListeningRef.current();
    } else {
      speechRecognitionRef.current = null;
      setIsMicRecording(false);
    }
  }, []);

  const handleClickMicButton = useCallback(() => {
    if (!hasMicSupport) return;
    initAudioContext();

    if (micActiveRef.current) {
      // Stop mic
      micActiveRef.current = false;
      speechRecognitionRef.current?.abort();
      speechRecognitionRef.current = null;
      setIsMicRecording(false);
      return;
    }

    // Start mic — fresh instance each time (Chrome doesn't allow reusing ended ones)
    micActiveRef.current = true;

    const doStart = () => {
      if (micActiveRef.current) startListening();
    };

    if (navigator.mediaDevices?.getUserMedia) {
      const timeout = setTimeout(() => {
        console.warn("getUserMedia timed out — mic may not be available");
      }, 5000);

      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          clearTimeout(timeout);
          doStart();
        })
        .catch((err) => {
          clearTimeout(timeout);
          console.warn("Microphone permission denied:", err);
        });
    } else {
      doStart();
    }
  }, [hasMicSupport, startListening]);

  const handleClickSendButton = useCallback(() => {
    initAudioContext(); // Must be called from user gesture on mobile
    onChatProcessStart(userMessage);
  }, [onChatProcessStart, userMessage]);

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
