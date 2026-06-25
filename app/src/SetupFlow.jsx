// ─────────────────────────────────────────────────────────
// Setup Flow — "Make it yours."
//
// A short guided flow to replace the starter seed numbers with Jay's real
// life, so the Becoming Index and the AI reason about reality. It writes
// the simple, high-signal metrics (ONA, Podium, content cadence) by
// PATCHING existing state — never clobbering the detailed skill tree or
// campaigns (those are edited in Move / Command). Reversible: every value
// is just normal app state, and the flow can be re-run anytime.
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useSyncedState } from './useSyncedState.js';
import { IconClose, IconCheck, IconArrowRight, IconChevronRight } from './components/icons.jsx';
import { ONA_STATS, INITIATIVES, SALES_STAGES, COACHES, BRANDS, HOOKS } from './data.js';
import { todayKey } from './usePersistentState.js';

const numField = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line-strong)',
  borderRadius: 12, padding: '13px 14px', color: 'var(--text)', fontSize: 17, outline: 'none',
  fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
};

function Field({ label, hint, prefix, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        {prefix && <span className="mono" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--dim)', fontSize: 16 }}>{prefix}</span>}
        <input
          type="number" inputMode="decimal" value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...numField, paddingLeft: prefix ? 30 : 14 }}
        />
      </div>
      {hint && <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.06em', marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

const num = (v, fb = 0) => { const n = parseFloat(v); return Number.isFinite(n) ? n : fb; };

export function SetupFlow({ open, onClose }) {
  const [ona, setOna] = useSyncedState('lifeos:ona', { stats: ONA_STATS, initiatives: INITIATIVES, sales: SALES_STAGES, coaches: COACHES });
  const [podium, setPodium] = useSyncedState('lifeos:podium', { orders: 0, revenue: 0, builds: 0 });
  const [content, setContent] = useSyncedState('lifeos:content', { hooks: HOOKS.map((text, i) => ({ id: i + 1, text })) });
  const [, setSetupDone] = useSyncedState('lifeos:setup-complete', null);

  const [step, setStep] = useState(0);
  // Local form mirrors current state; committed only on Finish.
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    const baseBrands = (content.brands && content.brands.length ? content.brands : BRANDS);
    setForm({
      members: String(ona.stats?.members ?? ''),
      mrr: String(ona.stats?.mrr ?? ''),
      nps: String(ona.stats?.nps ?? ''),
      revenue: String(podium.revenue ?? ''),
      orders: String(podium.orders ?? ''),
      builds: String(podium.builds ?? ''),
      brands: baseBrands.map((b) => ({ id: b.id, name: b.name, color: b.color, active: b.status !== 'Paused', pct: b.pct ?? 50 })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !form) return null;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const STEPS = ['Intro', 'Business', 'Podium', 'Content', 'Done'];
  const last = STEPS.length - 1;

  const finish = () => {
    setOna((o) => ({ ...o, stats: { ...(o.stats || {}), members: num(form.members, o.stats?.members ?? 0), mrr: num(form.mrr, o.stats?.mrr ?? 0), nps: num(form.nps, o.stats?.nps ?? 0) } }));
    setPodium((p) => ({ ...p, revenue: num(form.revenue, p.revenue), orders: num(form.orders, p.orders), builds: num(form.builds, p.builds) }));
    setContent((c) => {
      const prev = c.brands && c.brands.length ? c.brands : BRANDS;
      const brands = form.brands.map((fb) => {
        const base = prev.find((b) => b.id === fb.id) || BRANDS.find((b) => b.id === fb.id) || { id: fb.id, name: fb.name, color: fb.color, weeklyGoal: '5 posts', posted: 0 };
        return { ...base, name: fb.name, status: fb.active ? (base.status && base.status !== 'Paused' ? base.status : 'On Track') : 'Paused', pct: Math.round(fb.pct) };
      });
      return { ...c, brands };
    });
    setSetupDone(todayKey());
    onClose?.();
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 320, background: 'var(--bg-0)', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '54px 18px 10px' }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.16em' }}>SETUP · {String(step + 1).padStart(2, '0')}/{String(last + 1).padStart(2, '0')}</div>
        <div className="pressable" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'var(--muted)' }}><IconClose size={16} /></div>
      </div>
      {/* progress dots */}
      <div style={{ display: 'flex', gap: 6, padding: '0 18px 14px' }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= step ? 'var(--cyan)' : 'rgba(255,255,255,0.1)', transition: 'background 240ms' }} />
        ))}
      </div>

      {/* body */}
      <div className="screen-content" style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 20px', animation: 'screenArrive 320ms cubic-bezier(0.2,0.8,0.2,1)' }} key={step}>
        {step === 0 && (
          <div>
            <div className="display" style={{ fontSize: 32, lineHeight: 1.05, marginTop: 8 }}>MAKE IT YOURS</div>
            <div style={{ fontSize: 14.5, color: 'var(--text-2)', lineHeight: 1.6, marginTop: 14 }}>
              Your <span style={{ color: 'var(--cyan)' }}>Becoming</span> score and the AI are only as true as your numbers. A couple of minutes here replaces the starter data with your real life.
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginTop: 16 }}>
              We'll set your ONA business, Podium, and content cadence. Skills and goals stay where you fine-tune them (Move &amp; Command). Nothing is locked in until the last step — and you can re-run this anytime from Settings.
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="eyebrow" style={{ color: 'var(--cyan)' }}>Business · ONA</div>
            <div className="display" style={{ fontSize: 24, marginTop: 2, marginBottom: 16 }}>OBSTACLE NINJA ACADEMY</div>
            <Field label="Active members" hint="CURRENT PAYING MEMBERS" value={form.members} onChange={(v) => set({ members: v })} placeholder="248" />
            <Field label="Monthly recurring revenue" prefix="$" hint="MRR FROM MEMBERSHIPS" value={form.mrr} onChange={(v) => set({ mrr: v })} placeholder="38450" />
            <Field label="NPS" hint="MEMBER NET PROMOTER SCORE (-100 TO 100)" value={form.nps} onChange={(v) => set({ nps: v })} placeholder="72" />
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>Business · Podium Creations</div>
            <div className="display" style={{ fontSize: 24, marginTop: 2, marginBottom: 16 }}>PODIUM</div>
            <Field label="Revenue (this month)" prefix="$" hint="PRODUCT REVENUE MONTH-TO-DATE" value={form.revenue} onChange={(v) => set({ revenue: v })} placeholder="0" />
            <Field label="Open orders" hint="ORDERS IN THE PIPELINE" value={form.orders} onChange={(v) => set({ orders: v })} placeholder="0" />
            <Field label="Active builds" hint="PRODUCTS BEING BUILT NOW" value={form.builds} onChange={(v) => set({ builds: v })} placeholder="0" />
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="eyebrow" style={{ color: 'var(--magenta)' }}>Creativity · Content</div>
            <div className="display" style={{ fontSize: 24, marginTop: 2, marginBottom: 6 }}>YOUR BRANDS</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>
              Toggle the ones you're actively posting, and set this week's pace — how on-track each is.
            </div>
            {form.brands.map((b, i) => (
              <div key={b.id} className="hud glass" style={{ borderRadius: 14, padding: 12, marginBottom: 9, opacity: b.active ? 1 : 0.55 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: b.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{b.name}</span>
                  <div className="pressable" onClick={() => set({ brands: form.brands.map((x, j) => (j === i ? { ...x, active: !x.active } : x)) })}
                    style={{ width: 42, height: 24, borderRadius: 999, background: b.active ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)', border: `1px solid ${b.active ? 'var(--lime)' : 'var(--line-strong)'}`, position: 'relative', flexShrink: 0 }}>
                    <span style={{ position: 'absolute', top: 2, left: b.active ? 19 : 2, width: 18, height: 18, borderRadius: 999, background: b.active ? 'var(--lime)' : 'var(--muted)', transition: 'left 200ms' }} />
                  </div>
                </div>
                {b.active && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <input type="range" min={0} max={100} value={b.pct}
                      onChange={(e) => set({ brands: form.brands.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x)) })}
                      style={{ flex: 1, accentColor: b.color }} />
                    <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', width: 38, textAlign: 'right' }}>{b.pct}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="display" style={{ fontSize: 30, lineHeight: 1.05, marginTop: 8, color: 'var(--lime)' }}>YOU'RE SET</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginTop: 14 }}>
              Your Becoming will now reason about your real ONA, Podium, and content. It re-computes the moment you save.
            </div>
            <div className="hud glass" style={{ borderRadius: 14, padding: 14, marginTop: 18 }}>
              <div className="eyebrow" style={{ color: 'var(--cyan)', marginBottom: 8 }}>Still to fine-tune (when you're ready)</div>
              {[
                ['Skill levels', 'Move → tap a skill to set its %'],
                ['Your campaigns', 'Command → New Goal, or tap a campaign'],
                ['Relationships & life', 'Map → enter a domain'],
              ].map(([t, w]) => (
                <div key={t} style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 7 }}>
                  <IconChevronRight size={13} color="var(--cyan)" style={{ flexShrink: 0 }} />
                  <div><div style={{ fontSize: 13, color: 'var(--text)' }}>{t}</div><div className="mono" style={{ fontSize: 9, color: 'var(--dim)', marginTop: 1, letterSpacing: '0.06em' }}>{w.toUpperCase()}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* footer nav */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 18px calc(env(safe-area-inset-bottom, 0px) + 18px)', borderTop: '1px solid var(--line)' }}>
        {step > 0 && (
          <div className="pressable" onClick={() => setStep((s) => s - 1)} style={{ height: 50, padding: '0 20px', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)', color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>Back</div>
        )}
        <div className="pressable" onClick={() => (step === last ? finish() : setStep((s) => s + 1))}
          style={{ flex: 1, height: 50, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #45B7E8, #2DD4BF)', color: '#0A0B0D', fontWeight: 800, fontSize: 14, letterSpacing: '0.04em' }}>
          {step === last ? (<><IconCheck size={17} stroke={2.6} /> Save my data</>) : step === 0 ? (<>Let's go <IconArrowRight size={16} /></>) : (<>Next <IconArrowRight size={16} /></>)}
        </div>
      </div>
    </div>
  );
}
