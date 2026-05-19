import { useState, useRef, useCallback, useEffect } from "react";
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const utterRef = useRef(null);
  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setSpeakingId(null);
  }, []);
  const speak = useCallback((text, id) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "th-TH";
    u.rate = 0.85;
    u.pitch = 0.9;
    u.onend = () => {
      setSpeaking(false);
      setSpeakingId(null);
    };
    u.onerror = () => {
      setSpeaking(false);
      setSpeakingId(null);
    };
    utterRef.current = u;
    setSpeaking(true);
    setSpeakingId(id ?? null);
    window.speechSynthesis.speak(u);
  }, []);
  useEffect(() => () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);
  return { speak, stop, speaking, speakingId };
}
export {
  useTTS as u
};
