"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, RotateCw } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { cic?: string; title?: string; category?: string }[];
  timestamp: Date;
}

interface Props {
  lang?: string;
}

const SUGGESTIONS_ES = [
  "¿Por qué el deseo de Dios está inscrito en el corazón humano?",
  "¿Qué es la revelación divina?",
  "¿Cómo se manifiesta la Santísima Trinidad?",
  "¿Qué nos dice el CIC sobre los sacramentos?",
  "¿Cuál es el sentido de la vida humana?",
];

const SUGGESTIONS_EN = [
  "Why is the desire for God written on the human heart?",
  "What is divine revelation?",
  "How is the Holy Trinity manifested?",
  "What does the CCC teach about the sacraments?",
  "What is the meaning of human life?",
];

export default function Chat({ lang = "es" }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chunks, setChunks] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = lang === "en" ? {
    placeholder: "Ask a question about the faith...",
    send: "Send",
    loading: "Searching the Catechism...",
    welcome: "Welcome! I am your digital catechist. Ask me anything about the Catholic faith.",
    welcomeSub: "Based on the Catechism of the Catholic Church.",
    error: "Sorry, an error occurred. Try again.",
    tryAgain: "Try again",
    clear: "New conversation",
    poweredBy: "Local CCC search",
    disclaimer: "Responses based on local Catechism search. Verify with the official CCC.",
  } : {
    placeholder: "Haz una pregunta sobre la fe...",
    send: "Enviar",
    loading: "Buscando en el Catecismo...",
    welcome: "¡Bienvenido! Soy tu catequista digital. Pregúntame lo que quieras sobre la fe católica.",
    welcomeSub: "Basado en el Catecismo de la Iglesia Católica.",
    error: "Lo siento, hubo un error. Intenta de nuevo.",
    tryAgain: "Reintentar",
    clear: "Nueva conversación",
    poweredBy: "Búsqueda local en el CIC",
    disclaimer: "Las respuestas se basan en búsqueda local del Catecismo. Verifica con el CIC oficial.",
  };

  useEffect(() => {
    fetch("/data/cic-chunks.json")
      .then(r => r.json())
      .then(setChunks)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  function scoreChunk(chunk: any, query: string): number {
    const ql = query.toLowerCase();
    const words = ql.split(/\s+/).filter(w => w.length > 2);
    const cl = (chunk.content || "").toLowerCase();
    const tl = (chunk.title || "").toLowerCase();
    let score = 0;
    if (cl.includes(ql)) score += 10;
    if (tl.includes(ql)) score += 8;
    for (const w of words) {
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      score += (cl.match(new RegExp(esc, "g")) || []).length * 2;
      if (tl.includes(w)) score += 5;
    }
    if (chunk.type === "topic_overview") score += 2;
    return score;
  }

  function search(query: string, limit = 5): any[] {
    if (!query || chunks.length === 0) return [];
    return chunks
      .map((c: any) => ({ ...c, _s: scoreChunk(c, query) }))
      .filter((c: any) => c._s > 0)
      .sort((a: any, b: any) => b._s - a._s)
      .slice(0, limit);
  }

  function buildResponse(results: any[]): string {
    if (results.length === 0) {
      return lang === "en"
        ? "I couldn't find specific information about that. Could you rephrase your question?"
        : "No encontré información específica sobre eso en el Catecismo. ¿Puedes reformular tu pregunta?";
    }
    return results.map(c => {
      const ref = c.cic ? ` (CIC ${c.cic})` : "";
      return c.content.slice(0, 400) + (c.content.length > 400 ? "..." : "") + ref;
    }).join("\n\n");
  }

  function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Math.random().toString(36).slice(2), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError("");

    setTimeout(() => {
      const results = search(text);
      const resp = buildResponse(results);
      const citations = results.map(r => ({ cic: r.cic, title: r.title, category: r.category }));
      const asstMsg: Message = { id: Math.random().toString(36).slice(2), role: "assistant", content: resp, citations, timestamp: new Date() };
      setMessages(prev => [...prev, asstMsg]);
      setLoading(false);
    }, 350);
  }

  function clear() { setMessages([]); setError(""); }

  function handleKeydown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="chat-container max-w-2xl mx-auto rounded-2xl overflow-hidden border border-parchment-deeper bg-cream shadow-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gold-light/30 border-b border-parchment-deeper">
        <span className="text-xl">✝️</span>
        <div className="flex-1">
          <h3 className="font-serif text-base font-semibold text-gold-dark">
            {lang === "en" ? "Digital Catechist" : "Catequista Digital"}
          </h3>
          <p className="text-xs text-ink-soft">{t.poweredBy}</p>
        </div>
        <button onClick={clear} className="w-8 h-8 rounded-full border border-parchment-deeper bg-cream text-ink-soft hover:text-gold-dark hover:border-gold transition-colors flex items-center justify-center" title={t.clear}>
          <RotateCw size={14} />
        </button>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="h-[460px] overflow-y-auto p-5 bg-parchment space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center pt-16">
            <span className="text-5xl mb-4 block">🕊</span>
            <p className="font-serif text-base text-ink font-medium mb-1">{t.welcome}</p>
            <p className="text-sm text-ink-soft mb-6">{t.welcomeSub}</p>
            <div className="space-y-2 max-w-md mx-auto">
              {(lang === "en" ? SUGGESTIONS_EN : SUGGESTIONS_ES).map((s, i) => (
                <button key={i} onClick={() => { setInput(s); setTimeout(send, 50); }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl bg-cream border border-parchment-deeper text-sm text-ink hover:border-gold hover:bg-gold-light/20 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${msg.role === "user" ? "bg-gold-light" : "bg-gold-light/60"}`}>
              {msg.role === "user" ? "👤" : "🤖"}
            </span>
            <div className={`max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gold-light/40 rounded-br-md"
                  : "bg-cream border border-parchment-deeper rounded-bl-md"
              }`}>
                <p className="text-ink whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.citations && msg.citations.length > 0 && (
                <p className="text-xs text-ink-soft mt-1 ml-1">
                  📖 {msg.citations.map(c => c.cic ? `CIC ${c.cic}` : c.title).join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <span className="w-8 h-8 rounded-full bg-gold-light/60 flex items-center justify-center text-sm shrink-0">🤖</span>
            <div className="px-4 py-2.5 text-sm text-ink-soft italic">{t.loading}</div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose/5 border border-rose/20 text-rose text-sm">
            <X size={14} /><span>{error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-parchment-deeper bg-cream">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeydown}
            placeholder={t.placeholder}
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-parchment-deeper bg-parchment text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:border-gold transition-all max-h-28"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-gold text-white disabled:opacity-40 hover:bg-gold-dark transition-colors flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-ink-soft/60 text-center mt-2">{t.disclaimer}</p>
      </div>
    </div>
  );
}
