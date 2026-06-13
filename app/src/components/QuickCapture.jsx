import { useState, useEffect, useRef } from 'react';
import { IconCheck, IconClose, IconMic, IconSend } from './icons.jsx';
import { celebrate } from '../lib/haptics.js';
import { Sheet } from './Sheet.jsx';
import { voiceSupported, createListener } from '../lib/voice.js';

// ─────────────────────────────────────────────────────────
// Quick Capture — bottom sheet modal accessible from anywhere
// ─────────────────────────────────────────────────────────

const CAPTURE_TAGS = [
  { id: 'idea',  label: 'IDEA',  color: '#45B7E8' },
  { id: 'ona',   label: 'ONA',   color: '#FF6B5B' },
  { id: 'dream', label: 'DREAM', color: '#2DD4BF' },
  { id: 'task',  label: 'TASK',  color: '#34D399' },
];

function QuickCapture({ open, onClose, onSave, voiceMode = false }) {
  const [text, setText] = useState('');
  const [tag, setTag] = useState('idea');
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef(null);
  const listenerRef = useRef(null);

  // Real dictation — speech lands straight in the input.
  const stopListening = () => { listenerRef.current?.abort(); listenerRef.current = null; setRecording(false); };
  const startListening = () => {
    if (!voiceSupported()) return;
    stopListening();
    const l = createListener({
      onInterim: (t) => setText(t),
      onResult: (t) => setText(t),
      onEnd: () => setRecording(false),
    });
    if (!l) return;
    listenerRef.current = l;
    setRecording(true);
    l.start();
  };

  useEffect(() => {
    if (open) {
      setText('');
      setSaved(false);
      if (voiceMode && voiceSupported()) setTimeout(() => startListening(), 420);
      else setTimeout(() => inputRef.current?.focus(), 320);
    } else {
      stopListening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, voiceMode]);

  const tagColor = CAPTURE_TAGS.find(t => t.id === tag)?.color;

  const handleCapture = () => {
    if (!text.trim()) return;
    stopListening();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    onSave?.({
      id: now.getTime(),
      ts: now.getTime(),
      text: text.trim() || '[Voice memo]',
      tag,
      color: tagColor,
      time,
      status: 'inbox',
    });
    setSaved(true);
    celebrate();
    setTimeout(() => onClose?.(), 700);
  };

  return (
    <Sheet open={open} onClose={onClose} maxHeight="auto">
        {saved ? (
          <div style={{
            padding: '40px 0 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999,
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px -10px rgba(52,211,153,0.6)',
            }}>
              <IconCheck size={28} color="#34D399" stroke={2.5} />
            </div>
            <div className="display" style={{ fontSize: 24, color: 'var(--lime)' }}>CAPTURED</div>
            <div className="eyebrow">saved to your inbox · triage in Life</div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              <div>
                <div className="eyebrow">Quick Capture</div>
                <div className="display" style={{ fontSize: 24, marginTop: 2 }}>
                  WHAT'S ON YOUR MIND?
                </div>
              </div>
              <div
                className="pressable"
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 999,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--muted)',
                }}
              >
                <IconClose size={16} />
              </div>
            </div>

            {/* input row */}
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'stretch',
              marginBottom: 14,
            }}>
              <div style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${tagColor}40`,
                borderRadius: 14,
                padding: '12px 14px',
                position: 'relative',
                boxShadow: `0 0 30px -10px ${tagColor}60`,
              }}>
                <input
                  ref={inputRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or speak…"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text)',
                    fontSize: 16,
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              <div
                className="pressable"
                onClick={() => (recording ? stopListening() : startListening())}
                style={{
                  width: 48,
                  borderRadius: 14,
                  background: recording ? 'rgba(255,107,91,0.18)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${recording ? 'rgba(255,107,91,0.5)' : 'var(--line-strong)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: recording ? 'var(--ona-red)' : 'var(--text)',
                  boxShadow: recording ? '0 0 24px -6px rgba(255,107,91,0.6)' : 'none',
                  transition: 'all 200ms',
                }}
              >
                <IconMic size={20} className={recording ? 'blink' : ''} />
              </div>
            </div>

            {/* recording strip */}
            {recording && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 12,
                padding: '8px 12px',
                borderRadius: 10,
                background: 'rgba(255,107,91,0.08)',
                border: '1px solid rgba(255,107,91,0.25)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 999,
                  background: 'var(--ona-red)',
                  boxShadow: '0 0 8px var(--ona-red)',
                }} className="blink" />
                <span className="mono" style={{ fontSize: 11, color: 'var(--ona-red)' }}>
                  LISTENING · JUST TALK
                </span>
                <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: 4 + Math.abs(Math.sin(i * 0.7)) * 14,
                      background: 'var(--ona-red)',
                      borderRadius: 1,
                      opacity: 0.8,
                    }} className={i % 3 === 0 ? 'shimmer-cell' : ''} />
                  ))}
                </div>
              </div>
            )}

            {/* tag pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {CAPTURE_TAGS.map((t) => {
                const active = tag === t.id;
                return (
                  <div
                    key={t.id}
                    className="pressable"
                    onClick={() => setTag(t.id)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 12,
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      fontWeight: 700,
                      background: active ? `${t.color}18` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? t.color + '80' : 'var(--line)'}`,
                      color: active ? t.color : 'var(--muted)',
                      boxShadow: active ? `0 0 18px -4px ${t.color}80` : 'none',
                      transition: 'all 200ms',
                    }}
                  >{t.label}</div>
                );
              })}
            </div>

            {/* capture button */}
            <div
              className="pressable"
              onClick={handleCapture}
              style={{
                height: 52,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${tagColor} 0%, ${tagColor}80 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8,
                color: '#0A0B0D',
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: `0 8px 30px -8px ${tagColor}`,
              }}
            >
              <IconSend size={18} stroke={2.2} />
              <span>Capture</span>
            </div>

            <div className="eyebrow" style={{ textAlign: 'center', marginTop: 12 }}>
Tap + on any screen · long-press for voice
            </div>
          </>
        )}
    </Sheet>
  );
}

export { QuickCapture };
