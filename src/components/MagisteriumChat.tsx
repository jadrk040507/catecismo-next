"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, ExternalLink } from "lucide-react";

export default function MagisteriumChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isEn = pathname.startsWith("/en");
  const lang = isEn ? "en" : "es";

  const t = isEn
    ? {
        buttonLabel: "Ask Magisterium AI",
        title: "Magisterium AI",
        subtitle: "Trained on 28,000+ official Church documents",
        disclaimer:
          "Free queries via Magisterium AI. Opens their chat interface.",
        openExternal: "Open in new tab",
        loading: "Loading Magisterium AI...",
        error:
          "Could not load the chat. Try opening it directly.",
      }
    : {
        buttonLabel: "Pregunta a Magisterium AI",
        title: "Magisterium AI",
        subtitle: "Entrenada con 28,000+ documentos oficiales de la Iglesia",
        disclaimer:
          "Consultas gratuitas vía Magisterium AI. Abre su interfaz de chat.",
        openExternal: "Abrir en nueva pestaña",
        loading: "Cargando Magisterium AI...",
        error:
          "No se pudo cargar el chat. Intenta abrirlo directamente.",
      };

  // 15s timeout: if the iframe hasn't loaded by then, show fallback
  useEffect(() => {
    if (!open || loaded || iframeError) return;
    const timer = setTimeout(() => {
      if (!loaded && !iframeError) setTimeoutReached(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [open, loaded, iframeError]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset state on close
  const handleClose = useCallback(() => {
    setOpen(false);
    setIframeError(false);
    setTimeoutReached(false);
    setLoaded(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeError(true);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setLoaded(true);
    setIframeError(false);
    setTimeoutReached(false);
  }, []);

  const magisteriumUrl = isEn
    ? "https://www.magisterium.com/app"
    : "https://www.magisterium.com/es/app";

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={t.buttonLabel}
          className="magisterium-fab"
        >
          <MessageCircle size={22} />
          <span className="magisterium-fab-label">{t.buttonLabel}</span>
        </button>
      )}

      {/* Overlay + chat panel */}
      {open && (
        <div className="magisterium-overlay" onClick={handleClose}>
          <div
            className="magisterium-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="magisterium-panel-header">
              <div className="magisterium-panel-header-text">
                <h3>{t.title}</h3>
                <p>{t.subtitle}</p>
              </div>
              <button
                onClick={handleClose}
                className="magisterium-close-btn"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content: iframe or fallback */}
            <div className="magisterium-panel-body">
              {iframeError || timeoutReached ? (
                <div className="magisterium-fallback">
                  <div className="magisterium-fallback-icon">
                    {iframeError ? "⚠️" : "⏳"}
                  </div>
                  <p className="magisterium-fallback-title">
                    {iframeError ? t.error : t.loading}
                  </p>
                  <p className="magisterium-fallback-subtitle">
                    {t.disclaimer}
                  </p>
                  <a
                    href={magisteriumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="magisterium-fallback-link"
                  >
                    <ExternalLink size={16} />
                    {t.openExternal}
                  </a>
                </div>
              ) : (
                <>
                  {!loaded && (
                    <div className="magisterium-loading">
                      <div className="magisterium-spinner" />
                      <p>{t.loading}</p>
                    </div>
                  )}
                  <iframe
                    src={magisteriumUrl}
                    title="Magisterium AI Chat"
                    className="magisterium-iframe"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    loading="lazy"
                    onError={handleIframeError}
                    onLoad={handleIframeLoad}
                    style={{ display: loaded ? "block" : "none" }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
