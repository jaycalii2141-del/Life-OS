// Reusable bottom sheet that owns its own open/close lifecycle so it can
// animate OUT before unmounting (instead of snapping shut). Drop-in:
//   <Sheet open={open} onClose={onClose} maxHeight="88%">…content…</Sheet>
import { useState, useEffect, useRef } from 'react';

export function Sheet({ open, onClose, children, maxHeight = '90%', label = 'App panel' }) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef(null);

  useEffect(() => {
    if (open) { setMounted(true); setClosing(false); return; }
    if (mounted) {
      setClosing(true);
      const t = setTimeout(() => { setMounted(false); setClosing(false); }, 240);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return undefined;
    const prior = document.activeElement;
    const focusTimer = window.setTimeout(() => sheetRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      prior?.focus?.();
    };
  }, [mounted, open, onClose]);

  if (!mounted) return null;

  return (
    <>
      <div className={`scrim${closing ? ' scrim-closing' : ''}`} onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        className={`sheet${closing ? ' sheet-closing' : ''}`}
        style={{ maxHeight, overflowY: 'auto' }}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        <div className="sheet-handle" />
        {children}
      </div>
    </>
  );
}
