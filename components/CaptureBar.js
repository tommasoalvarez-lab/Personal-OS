"use client";

import { useEffect, useRef, useState } from "react";

const LABELS = {
  task: "Task",
  persone: "Persone",
  finanze: "Finanze",
  nutrizione: "Nutrizione",
  salute: "Salute",
  obiettivi: "Obiettivi",
  memoria: "Memoria",
};

export default function CaptureBar() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("riposo"); // riposo | ascolto | elaborazione | fatto
  const [resultLabel, setResultLabel] = useState("");
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      setStatus("riposo");
    };
    recognition.onerror = () => setStatus("riposo");
    recognition.onend = () => {
      setStatus((s) => (s === "ascolto" ? "riposo" : s));
    };

    recognitionRef.current = recognition;
  }, []);

  function toggleMic() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (status === "ascolto") {
      recognition.stop();
      setStatus("riposo");
    } else {
      setText("");
      setStatus("ascolto");
      recognition.start();
    }
  }

  async function send() {
    const testo = text.trim();
    if (!testo || status === "elaborazione") return;

    setStatus("elaborazione");
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testo }),
      });
      const data = await res.json();
      setResultLabel(LABELS[data.destinazione] || data.destinazione || "?");
      setStatus("fatto");
      setText("");
    } catch {
      setResultLabel("errore — riprova");
      setStatus("fatto");
    }
    setTimeout(() => {
      setStatus("riposo");
      setResultLabel("");
      inputRef.current?.focus();
    }, 2500);
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }

  const statusLabel =
    status === "fatto"
      ? `→ ${resultLabel}`
      : status === "ascolto"
      ? "in ascolto..."
      : status === "elaborazione"
      ? "elaborazione..."
      : "a riposo";

  return (
    <div className="capture-bar">
      <div className="capture-status">{statusLabel}</div>
      <button
        className={`capture-mic ${status === "ascolto" ? "listening" : ""}`}
        aria-label="Registra"
        onClick={toggleMic}
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={status === "elaborazione"}
        placeholder="Scrivi o parla — task, persone, finanze, note..."
      />
      <button className="capture-send" aria-label="Invia" onClick={send} type="button">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
}
