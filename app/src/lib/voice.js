// ─────────────────────────────────────────────────────────
// LifeOS — Voice layer.
// Speech-to-text via the Web Speech API (built into Safari/Chrome,
// no key, no server) and text-to-speech via speechSynthesis.
// Powers the hands-free Intelligence loop: speak → transcribe →
// answer → speak back → listen again.
// ─────────────────────────────────────────────────────────

const SR = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

export function voiceSupported() {
  return !!SR;
}

export function ttsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// One-shot listener: live interim text while you talk, final transcript
// when you pause. Returns { start, stop }.
export function createListener({ onInterim, onResult, onEnd, onError } = {}) {
  if (!SR) return null;
  const rec = new SR();
  rec.lang = navigator.language || 'en-US';
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  let finalText = '';
  let done = false;

  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText += t;
      else interim += t;
    }
    onInterim?.((finalText + interim).trim());
  };
  rec.onerror = (e) => { done = true; onError?.(e.error); onEnd?.(); };
  rec.onend = () => {
    if (done) return;
    done = true;
    const text = finalText.trim();
    if (text) onResult?.(text);
    onEnd?.();
  };

  return {
    start: () => { try { rec.start(); } catch { /* already started */ } },
    stop: () => { try { rec.stop(); } catch { /* not started */ } },
    abort: () => { done = true; try { rec.abort(); } catch { /* ignore */ } },
  };
}

// Strip markdown/emoji/markup so the voice reads naturally.
function cleanForSpeech(text) {
  return String(text || '')
    .replace(/ACTIONS_JSON:[\s\S]*$/, '')
    .replace(/[*_#`>]+/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let voiceCache = null;
function pickVoice() {
  if (!ttsSupported()) return null;
  if (voiceCache) return voiceCache;
  const voices = window.speechSynthesis.getVoices() || [];
  const lang = (navigator.language || 'en-US').slice(0, 2);
  voiceCache =
    voices.find((v) => v.lang?.startsWith(lang) && /Samantha|Ava|Daniel|Karen|Google US English|Natural/i.test(v.name)) ||
    voices.find((v) => v.lang?.startsWith(lang)) ||
    voices[0] || null;
  return voiceCache;
}
// Voices load async in some browsers.
if (ttsSupported()) {
  window.speechSynthesis.onvoiceschanged = () => { voiceCache = null; pickVoice(); };
}

export function speak(text, { onEnd } = {}) {
  if (!ttsSupported()) { onEnd?.(); return; }
  const clean = cleanForSpeech(text);
  if (!clean) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean.slice(0, 1200));
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = 1.04;
  u.pitch = 1.0;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
