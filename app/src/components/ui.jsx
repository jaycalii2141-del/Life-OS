// ─────────────────────────────────────────────────────────
// UI primitives — the reusable design-system layer.
//
// Thin wrappers over the token-backed classes in styles.css so screens stop
// re-deriving the same inline styles. Migrate inline cards/buttons onto
// these incrementally. Everything forwards className/style/handlers so it
// drops in beside existing markup without fighting it.
// ─────────────────────────────────────────────────────────
const cx = (...a) => a.filter(Boolean).join(' ');

export function Card({ lg, quiet, tap, className, style, children, ...rest }) {
  return (
    <div className={cx('card', lg && 'card-lg', quiet && 'card-quiet', tap && 'pressable', className)} style={style} {...rest}>
      {children}
    </div>
  );
}

export function Button({ variant = 'primary', block, lg, className, children, ...rest }) {
  return (
    <button
      className={cx('btn', variant === 'ghost' ? 'btn-ghost' : 'btn-primary', block && 'btn-block', lg && 'btn-lg', className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Stack({ gap, className, children, ...rest }) {
  return <div className={cx('stack', gap && `stack-${gap}`, className)} {...rest}>{children}</div>;
}

// A consistent section heading: quiet eyebrow + display title + optional trailing control.
export function SectionHeader({ eyebrow, title, trailing, accent = 'var(--cyan)' }) {
  return (
    <div className="row-between" style={{ marginBottom: 'var(--space-2)' }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div className="eyebrow" style={{ color: accent }}>{eyebrow}</div>}
        {title && <div className="section-title" style={{ fontSize: 'var(--text-lg)', marginTop: 1 }}>{title}</div>}
      </div>
      {trailing}
    </div>
  );
}

// One voice for "there's nothing here yet" moments.
export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      {title && <div className="empty-title">{title}</div>}
      {children && <div className="empty-body">{children}</div>}
    </div>
  );
}
