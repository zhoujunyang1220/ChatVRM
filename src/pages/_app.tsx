import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@charcoal-ui/icons";
import { useEffect } from "react";
import { initAudioContext } from "@/features/lipSync/lipSync";

/**
 * Initialize shared AudioContext on first user interaction (required by mobile browsers)
 */
function initAudioOnUserGesture() {
  const handler = () => {
    try {
      initAudioContext();
    } catch (e) {
      console.warn("AudioContext init failed:", e);
    }
    document.removeEventListener("click", handler);
    document.removeEventListener("touchstart", handler);
    document.removeEventListener("keydown", handler);
  };
  document.addEventListener("click", handler, { once: true });
  document.addEventListener("touchstart", handler, { once: true });
  document.addEventListener("keydown", handler, { once: true });
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize AudioContext on first user gesture (mobile requirement)
    initAudioOnUserGesture();

    // Register service worker for offline support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    }
  }, []);

  return <Component {...pageProps} />;
}
