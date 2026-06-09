// Reusable bottom sheet that owns its own open/close lifecycle so it can
// animate OUT before unmounting (instead of snapping shut). Drop-in:
//   <Sheet open={open} onClose={onClose} maxHeight="88%">…content…</Sheet>
import { useState, useEffect } from 'react';

export function Sheet({ open, onClose, children, maxHeight = '90%' }) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) { setMounted(true); setClosing(false); return; }
    if (mounted) {
      setClosing(true);
      const t = setTimeout(() => { setMounted(false); setClosing(false); }, 240);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      <div className={`scrim${closing ? ' scrim-closing' : ''}`} onClick={onClose} />
      <div className={`sheet${closing ? ' sheet-closing' : ''}`} style={{ maxHeight, overflowY: 'auto' }}>
        <div className="sheet-handle" />
        {children}
      </div>
    </>
  );
}
