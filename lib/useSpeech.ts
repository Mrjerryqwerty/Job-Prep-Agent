"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Browser speech: recognition for the candidate's voice, synthesis for the interviewer.
// Works in Chrome/Edge; other browsers fall back to typing.
export function useSpeech() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<any>(null);
  const wantRef = useRef(false);
  const finalRef = useRef("");

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev: any) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalRef.current += t + " ";
        else interim += t;
      }
      setTranscript((finalRef.current + interim).trim());
    };
    // Chrome ends recognition after silence; restart while the user still wants to talk.
    rec.onend = () => { if (wantRef.current) { try { rec.start(); } catch {} } else setListening(false); };
    rec.onerror = (e: any) => { if (e.error === "not-allowed") { wantRef.current = false; setListening(false); } };
    recRef.current = rec;
    return () => { wantRef.current = false; try { rec.abort(); } catch {} window.speechSynthesis?.cancel(); };
  }, []);

  const start = useCallback((initial = "") => {
    finalRef.current = initial ? initial + " " : "";
    setTranscript(initial);
    wantRef.current = true;
    setListening(true);
    try { recRef.current?.start(); } catch {}
  }, []);

  const stop = useCallback(() => {
    wantRef.current = false;
    setListening(false);
    try { recRef.current?.stop(); } catch {}
  }, []);

  const speak = useCallback((text: string) => new Promise<void>((resolve) => {
    const s = window.speechSynthesis;
    if (!s) return resolve();
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = s.getVoices().find((x) => /en-IN/i.test(x.lang)) ?? s.getVoices().find((x) => /^en/i.test(x.lang));
    if (v) u.voice = v;
    u.rate = 1;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    s.speak(u);
  }), []);

  const cancelSpeech = useCallback(() => window.speechSynthesis?.cancel(), []);

  return { supported, listening, transcript, setTranscript, start, stop, speak, cancelSpeech };
}
