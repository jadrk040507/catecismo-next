"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ReadAloudProps {
  htmlContent: string;
  lang: "es" | "en";
  title: string;
}

type Status = "idle" | "playing" | "paused";

export default function ReadAloud({ htmlContent, lang, title }: ReadAloudProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [speed, setSpeed] = useState<number>(1);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIdx, setSelectedVoiceIdx] = useState<number>(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencesRef = useRef<string[]>([]);
  const indexRef = useRef(0);

  // Check support
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  // Load voices
  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, [supported]);

  // Filter voices for current language
  const langVoices = voices.filter((v) =>
    lang === "es" ? v.lang.startsWith("es") : v.lang.startsWith("en")
  );

  // Build sentence list once per htmlContent change
  useEffect(() => {
    sentencesRef.current = extractText(htmlContent);
  }, [htmlContent]);

  // Pick voice
  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (langVoices.length === 0) return null;
    const idx = Math.min(selectedVoiceIdx, langVoices.length - 1);
    return langVoices[idx] || null;
  }, [langVoices, selectedVoiceIdx]);

  // Speak one sentence
  const speakSentence = useCallback(
    (idx: number) => {
      if (idx >= sentencesRef.current.length) {
        setStatus("idle");
        indexRef.current = 0;
        return;
      }

      const voice = pickVoice();
      const utterance = new SpeechSynthesisUtterance(sentencesRef.current[idx]);
      if (voice) utterance.voice = voice;
      utterance.lang = lang === "es" ? "es-MX" : "en-US";
      utterance.rate = speed;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        indexRef.current++;
        speakSentence(indexRef.current);
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          indexRef.current++;
          speakSentence(indexRef.current);
        }
      };

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [lang, pickVoice, speed]
  );

  // Start playing from beginning
  const play = useCallback(() => {
    speechSynthesis.cancel();
    indexRef.current = 0;
    setStatus("playing");
    const v = speechSynthesis.getVoices();
    if (v.length > 0) {
      speakSentence(0);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        speakSentence(0);
      };
    }
  }, [speakSentence]);

  // Resume from current position
  const resume = useCallback(() => {
    setStatus("playing");
    speakSentence(indexRef.current);
  }, [speakSentence]);

  // Pause
  const pause = useCallback(() => {
    speechSynthesis.pause();
    setStatus("paused");
  }, []);

  // Stop
  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setStatus("idle");
    indexRef.current = 0;
  }, []);

  // Main button handler
  const handleClick = useCallback(() => {
    switch (status) {
      case "idle":
        play();
        break;
      case "playing":
        pause();
        break;
      case "paused":
        resume();
        break;
    }
  }, [status, play, pause, resume]);

  if (!supported) return null;

  const label =
    status === "playing"
      ? lang === "es"
        ? "Pausar"
        : "Pause"
      : status === "paused"
        ? lang === "es"
          ? "Reanudar"
          : "Resume"
        : lang === "es"
          ? "Escuchar"
          : "Listen";

  const speeds = [0.75, 1, 1.25];

  return (
    <div className="no-print flex flex-wrap items-center gap-2 p-3 rounded-lg border border-border-light bg-neutral">
      {/* Play / Pause / Resume */}
      <button
        onClick={handleClick}
        aria-label={label}
        title={label}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-white hover:opacity-90 transition-opacity text-base"
      >
        {status === "playing" ? "⏸" : status === "paused" ? "▶" : "▶"}
      </button>

      {/* Stop (only when active) */}
      {status !== "idle" && (
        <button
          onClick={stop}
          aria-label={lang === "es" ? "Detener" : "Stop"}
          title={lang === "es" ? "Detener" : "Stop"}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-surface border border-border-light text-secondary hover:text-primary hover:border-border transition-colors text-base"
        >
          ⏹
        </button>
      )}

      {/* Speed selector */}
      <div className="inline-flex items-center rounded-md border border-border-light bg-surface overflow-hidden text-xs font-medium">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-2 py-1.5 transition-colors ${
              speed === s
                ? "bg-accent text-white"
                : "text-secondary hover:text-primary"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Voice selector (only if multiple voices available) */}
      {langVoices.length > 1 && (
        <select
          value={selectedVoiceIdx}
          onChange={(e) => setSelectedVoiceIdx(Number(e.target.value))}
          className="text-xs border border-border-light rounded-md bg-surface text-primary px-2 py-1.5 max-w-[140px] truncate"
        >
          {langVoices.map((v, i) => (
            <option key={i} value={i}>
              {v.name.replace(/Microsoft |Google |Apple /, "")}
            </option>
          ))}
        </select>
      )}

      {/* Label */}
      <span className="text-sm text-secondary ml-1 hidden sm:inline">
        {label}
      </span>
    </div>
  );
}

/**
 * Extract plain text sentences from lesson HTML.
 */
function extractText(html: string): string[] {
  let clean = html;
  // Remove style/script blocks
  clean = clean.replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  // Replace block-level closing tags with sentence breaks
  clean = clean.replace(/<\/(h[1-6]|p|li|div|section|article|blockquote|tr)>/gi, ". ");
  // Replace <br> with break
  clean = clean.replace(/<br\s*\/?>/gi, ". ");
  // Remove remaining HTML tags
  clean = clean.replace(/<[^>]*>/g, "");
  // Decode common HTML entities
  clean = clean
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&raquo;/g, "»")
    .replace(/&laquo;/g, "«")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
  // Split into sentences, filter empties
  return clean
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}