// ─────────────────────────────────────────────────────────
// ErrorBoundary — catches render-time throws in a screen chunk so
// one bad render shows a recover card instead of white-screening
// the whole app. Resets automatically when `resetKey` changes
// (e.g. switching tabs), so a crash on one screen doesn't trap you.
// ─────────────────────────────────────────────────────────
import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '40px 28px',
          textAlign: 'center',
          minHeight: 320,
        }}
      >
        <div style={{ fontSize: 30 }}>⚠️</div>
        <div className="section-title" style={{ fontSize: 18 }}>This screen hit a snag</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 280 }}>
          Something broke while rendering. Your data is safe — it's stored locally and synced.
        </div>
        <div
          className="pressable"
          onClick={() => this.setState({ error: null })}
          style={{
            marginTop: 4,
            padding: '11px 22px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--line-strong)',
            color: 'var(--text)',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Try again
        </div>
        <div
          className="pressable"
          onClick={() => window.location.reload()}
          style={{ fontSize: 12, color: 'var(--dim)', fontWeight: 600 }}
        >
          Reload the app
        </div>
      </div>
    );
  }
}
