import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@charcoal-ui/icons";
import { useEffect } from "react";

/**
 * Initialize AudioContext on first user interaction (required by mobile browsers)
 */
function initAudioOnUserGesture() {
  const handler = () => {
    try {
      const ctx = new AudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
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
