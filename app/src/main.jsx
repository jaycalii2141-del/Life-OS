import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { installGlobalHaptics } from './lib/haptics.js';
import './styles.css';

installGlobalHaptics();

// ── Stale-deploy recovery ──
// When a new deploy lands while a tab is open, hashed lazy-chunk filenames
// change and the old page 404s on dynamic import ("Failed to fetch
// dynamically imported module"). Reload once to fetch the fresh index +
// chunks. A 10s window guards against reload loops while still allowing
// recovery from a genuinely later deploy.
function recoverFromStaleChunk() {
  try {
    const last = +(sessionStorage.getItem('jamhq:chunk-reload-at') || 0);
    if (Date.now() - last < 10000) return;
    sessionStorage.setItem('jamhq:chunk-reload-at', String(Date.now()));
    window.location.reload();
  } catch {
    window.location.reload();
  }
}
window.addEventListener('vite:preloadError', (e) => { try { e.preventDefault(); } catch { /* */ } recoverFromStaleChunk(); });
window.addEventListener('unhandledrejection', (e) => {
  const msg = String((e && e.reason && e.reason.message) || (e && e.reason) || '');
  if (/dynamically imported module|importing a module script failed|Failed to fetch/i.test(msg)) recoverFromStaleChunk();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

// Register the service worker so the app installs as a PWA and works offline.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
