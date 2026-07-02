// ─────────────────────────────────────────────────────────
// LifeOS V2 — TODAY. The operating system's front door.
//
// Hierarchy is strict:
//   L1 · Today's Mission — what matters, what's next, progress.
//   L2 · Check-in (readiness) + Momentum (streak).
//   L3 · Intelligence brief + timeline — collapsed until wanted.
// Opening the app answers, in one glance: what matters most,
// what to do next, what can wait, and how the campaign is going.
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ProgressBar, StateMeter, TimelineEvent, Pill } from '../components/atoms.jsx';
import { IconCheck, IconSparkles, IconChevronDown, IconChevronRight, IconCalendar, IconClose, IconPlus, IconSliders, IconMic, IconFlame, IconTarget, IconWarn, IconActivity, IconCompass, IconArrowRight, IconTrendUp, kindIcon, domainIcon } from '../components/icons.jsx';
import { ChiefBrief } from '../ChiefBrief.jsx';
import { celebrate, dayComplete } from '../lib/haptics.js';
import { estimateLabel } from '../lib/mission.js';
import { SEED_QUESTS, questProgress, nextMilestone, recentWins, LIFE_MAP_DOMAINS } from '../lib/quests.js';
import { becomingLine } from '../lib/becoming.js';
import { lifeLevel } from '../lib/level.js';
import { proactiveInsight } from '../lib/presence.js';
import { evaluateMilestones } from '../lib/milestones.js';
import { TheSelf } from '../components/TheSelf.jsx';
import { EmptyState } from '../components/ui.jsx';
import { CloseDay } from '../components/CloseDay.jsx';
import { awardXp } from '../lib/xp.js';
import { fireCeremony } from '../lib/ceremony.js';
import { GoalDecomposer } from '../GoalDecomposer.jsx';
import { ObjectMenu } from '../components/ObjectMenu.jsx';
import { useLongPress } from '../lib/useLongPress.js';
import { askCompanion, decomposeText } from '../lib/aiActions.js';
import { useSyncedState } from '../useSyncedState.js';
import { TIMELINE } from '../data.js';

function realDateLabel() {
  const d = new Date();
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}
function greetingLabel() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning, Jay' : h < 18 ? 'Good afternoon, Jay' : 'Good evening, Jay';
}

const KIND_COLORS = { focus: '#FF6B5B', train: '#34D399', build: '#E9C46A', ritual: '#45B7E8' };

// ─────────────────────────────────────────────────────────
// L1 — Today's Mission
// ─────────────────────────────────────────────────────────
function MissionCard({ missions, doneIds, onToggle, onRegenerate, readiness, streak, onGo, oneThing, onSetOneThing, becoming, level, adaptedAt, starterData, onCalibrate }) {
  const [party, setParty] = useState(0);
  const [editingFocus, setEditingFocus] = useState(false);
  const [draft, setDraft] = useState('');
  const [menuMission, setMenuMission] = useState(null);

  // Flash a brief "re-planned" badge when the engine adapts to readiness.
  const [adaptedFlash, setAdaptedFlash] = useState(false);
  useEffect(() => {
    if (!adaptedAt) return;
    if (Date.now() - adaptedAt > 8000) return;
    setAdaptedFlash(true);
    const t = setTimeout(() => setAdaptedFlash(false), 6000);
    return () => clearTimeout(t);
  }, [adaptedAt]);

  const total = missions.length;
  const done = missions.filter((m) => doneIds.includes(m.id)).length;
  const allDone = total > 0 && done === total;
  const next = missions.find((m) => !doneIds.includes(m.id));

  const toggle = (m) => {
    const isDone = doneIds.includes(m.id);
    if (!isDone) {
      if (done + 1 === total) { setParty((p) => p + 1); dayComplete(); } // the day closes
      else celebrate();
      awardXp(12, 'mission');
    }
    onToggle(m.id);
  };

  return (
    <div className="hud glass-strong mesh-readiness" style={{ padding: '24px 18px 18px', borderRadius: 'var(--r-xl)', position: 'relative', overflow: 'visible' }}>

      {/* Ritual header — you arrive to The Self: large, centered, breathing.
          One column with generous rhythm; the day's emotional centerpiece,
          not a metric tucked in a corner. (Bridge reframe; damn-moment #1.) */}
      <div className="center" style={{ paddingTop: 'var(--space-1)' }}>
        <span className="eyebrow">{realDateLabel()}</span>
        {becoming && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-3)' }}>
            <TheSelf facets={becoming.facets} becoming={becoming.score} level={level} trend={becoming.trend} size={136} />
          </div>
        )}
        <div className="serif" style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-3)', lineHeight: 1.1 }}>{greetingLabel()}</div>
        {becoming && (
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', marginTop: 'var(--space-1)', lineHeight: 1.35, textWrap: 'pretty', maxWidth: 280, marginInline: 'auto' }}>{becomingLine(becoming)}</div>
        )}
        <div className="row" style={{ justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
          {readiness != null && (
            <span className="mono" style={{ fontSize: 10, color: readiness >= 75 ? 'var(--lime)' : readiness >= 50 ? 'var(--gold)' : 'var(--ona-red)', letterSpacing: '0.02em' }}>Ready {readiness}</span>
          )}
          {streak > 0 && <span className="mono" style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 3 }}><IconFlame size={11} color="var(--gold)" /> {streak} DAY</span>}
          {becoming && becoming.delta !== 0 && (
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.08em', color: becoming.trend === 'rising' ? 'var(--lime)' : becoming.trend === 'dipping' ? 'var(--ona-red)' : 'var(--muted)' }}>
              {becoming.delta > 0 ? '▲+' : '▼'}{Math.abs(becoming.delta)} · 7D
            </span>
          )}
        </div>
        {/* Honesty: until real numbers are in, say so — an instrument that
            admits it's uncalibrated earns trust. Tap → Settings → setup. */}
        {starterData && (
          <div className="pressable" onClick={onCalibrate} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 'var(--space-3)',
            padding: '4px 10px', borderRadius: 'var(--r-pill)',
            background: 'rgba(233,196,106,0.09)', border: '1px dashed rgba(233,196,106,0.4)',
            fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600, color: 'var(--gold)',
          }}>
            Starter data — tap to make it yours
          </div>
        )}
      </div>

      <hr className="hr" style={{ margin: 'var(--space-5) 0 0' }} />

      {/* progress line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="eyebrow" style={{ color: 'var(--cyan)' }}>Today's mission</span>
          {adaptedFlash && (
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 10, color: 'var(--gold)', letterSpacing: '0.01em', padding: '2px 8px', borderRadius: 999, background: 'rgba(233,196,106,0.14)', border: '1px solid rgba(233,196,106,0.4)', animation: 'screenFade 300ms ease' }}>Re-planned for readiness</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
            {done}/{total} · {estimateLabel(missions, doneIds)}
          </span>
          <div className="pressable" onClick={onRegenerate} title="Re-plan"
            style={{ width: 26, height: 26, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)', background: 'rgba(69,183,232,0.1)' }}>
            <IconSparkles size={14} />
          </div>
        </div>
      </div>
      <ProgressBar value={total ? (done / total) * 100 : 0} color={allDone ? 'var(--lime)' : 'var(--cyan)'} height={4} />

      {/* mission list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        {missions.map((m) => (
          <MissionRow key={m.id} m={m} isDone={doneIds.includes(m.id)} isNext={next && next.id === m.id}
            menuOpen={menuMission?.id === m.id}
            onToggle={() => toggle(m)} onGo={() => onGo(m)} onLongPress={() => setMenuMission(m)} />
        ))}

        {allDone && (
          <div style={{ position: 'relative', textAlign: 'center', padding: '16px 0 6px', overflow: 'visible' }}>
            <div className="ceremony-bloom" />
            <div className="ceremony-text" style={{ position: 'relative' }}>
              <div className="serif" style={{ fontSize: 26, color: 'var(--lime)' }}>Day closed</div>
              {becoming && (
                <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.35, textWrap: 'pretty' }}>
                  You showed up — {becomingLine(becoming).toLowerCase()}{becoming.delta > 0 ? ` · ▲+${becoming.delta}` : ''}
                </div>
              )}
              <div className="eyebrow" style={{ marginTop: 6 }}>day {streak} of the streak · rest easy</div>
            </div>
          </div>
        )}
      </div>

      {/* one-thing setter (only when unset) */}
      {!oneThing && !allDone && (
        editingFocus ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { onSetOneThing(draft.trim()); setEditingFocus(false); } }}
              placeholder="The one win that makes today a success…"
              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,107,91,0.4)', borderRadius: 12, padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)' }} />
            <div className="pressable" onClick={() => { if (draft.trim()) { onSetOneThing(draft.trim()); } setEditingFocus(false); }}
              style={{ width: 44, borderRadius: 12, background: 'linear-gradient(135deg, #FF6B5B, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <IconCheck size={16} stroke={2.4} />
            </div>
          </div>
        ) : (
          <div className="pressable" onClick={() => setEditingFocus(true)} style={{
            marginTop: 12, padding: '11px 12px', borderRadius: 12, textAlign: 'center',
            border: '1px dashed rgba(255,107,91,0.45)', color: 'var(--ona-red)',
            fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.01em', fontWeight: 600,
          }}>Set your one thing</div>
        )
      )}

      <ObjectMenu
        open={!!menuMission}
        onClose={() => setMenuMission(null)}
        title={menuMission?.title}
        subtitle={menuMission?.why}
        accent="var(--cyan)"
        actions={menuMission ? missionActions(menuMission, onSetOneThing, () => setMenuMission(null)) : []}
      />
    </div>
  );
}

// Contextual actions for a daily mission object.
function missionActions(m, onSetOneThing, close) {
  return [
    { id: 'approach', ai: true, icon: <IconActivity size={15} />, label: 'How should I approach this?', hint: 'A practical way in', run: () => askCompanion(`For my task today — "${m.title}" — give me a tight, practical way to approach it in the next focused block. 2-3 sentences, specific, no preamble.`) },
    { id: 'why', ai: true, icon: <IconTarget size={15} />, label: 'Why does this matter?', hint: 'The stakes, honestly', run: () => askCompanion(`In 2 sentences, why does "${m.title}" matter for me today? Then one sentence on the real cost of skipping it. Direct, no fluff.`) },
    { id: 'focus', ai: false, icon: <IconCompass size={15} />, label: 'Set as my One Thing', hint: 'Make it today’s priority', run: () => { onSetOneThing?.(m.title); close?.(); } },
  ];
}

// A single daily mission — an interactive object.
//   tap on the body → go to its screen   ·   long-press → AI actions
function MissionRow({ m, isDone, isNext, menuOpen, onToggle, onGo, onLongPress }) {
  const c = KIND_COLORS[m.kind] || 'var(--cyan)';
  const lp = useLongPress(onLongPress, onGo);
  // Swipe-to-complete: the row travels on a horizontal drag; a green
  // affordance surfaces behind it, and releasing past the threshold toggles.
  // The checkbox remains — the gesture is an accelerant, not the only path.
  const x = useMotionValue(0);
  const affordance = useTransform(x, [12, 88], [0, 1]);

  return (
    <div style={{ position: 'relative' }}>
      {/* revealed behind the traveling row */}
      <motion.div style={{
        opacity: affordance, position: 'absolute', inset: 0, borderRadius: 14,
        background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.35)',
        display: 'flex', alignItems: 'center', paddingLeft: 18, color: 'var(--lime)',
      }}>
        <IconCheck size={18} stroke={2.6} />
      </motion.div>

      <motion.div
        className={menuOpen ? 'obj-pulse' : ''}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        dragTransition={{ bounceStiffness: 420, bounceDamping: 26 }}
        onDragEnd={(_, info) => { if (info.offset.x > 88) onToggle(); }}
        animate={{ opacity: isDone ? 0.55 : 1 }}
        style={{
          x, touchAction: 'pan-y', position: 'relative',
          padding: '10px 12px', borderRadius: 14,
          background: isNext ? 'rgba(69,183,232,0.07)' : 'rgba(19,19,22,0.92)',
          border: `1px solid ${menuOpen ? 'rgba(69,183,232,0.55)' : isNext ? 'rgba(69,183,232,0.45)' : 'var(--line)'}`,
        }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
        {/* 44px hit area; the visual box stays 24px. */}
        <div className="pressable" onClick={onToggle} style={{ flexShrink: 0, margin: '-9px -10px -10px -10px', padding: 10, display: 'flex', alignItems: 'flex-start' }}>
          <motion.div
            animate={isDone ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: [0.34, 1.4, 0.64, 1] }}
            style={{
              width: 24, height: 24, borderRadius: 8,
              border: `1.5px solid ${isDone ? 'var(--lime)' : c}`,
              background: isDone ? 'var(--lime)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {isDone && <IconCheck size={14} color="#0A0B0D" stroke={3} />}
          </motion.div>
        </div>
        <div {...lp} style={{ flex: 1, minWidth: 0, touchAction: 'pan-y' }} className="pressable">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {(() => { const K = kindIcon(m.kind); return <K size={15} color={c} stroke={2} style={{ flexShrink: 0 }} />; })()}
            <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, textDecoration: isDone ? 'line-through' : 'none', textWrap: 'pretty' }}>
              {m.title}
            </span>
          </div>
          {!isDone && (
            <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4, marginTop: 3 }}>{m.why}</div>
          )}
          {isNext && (
            <div className="mono" style={{ fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.04em', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
              Next up · ~{m.est}m <IconChevronRight size={11} />
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </div>
  );
}

// Contextual actions for a goal/campaign object.
function campaignActions(q, openRoadmap) {
  return [
    { id: 'breakdown', ai: true, icon: <IconTarget size={15} />, label: 'Break into next actions', hint: 'A sequenced path of milestones', run: () => decomposeText(q.title, q.domain) },
    { id: 'blockers', ai: true, icon: <IconWarn size={15} />, label: 'Analyze blockers', hint: 'What’s in the way + the unblock', run: () => askCompanion(`I'm working toward this goal: "${q.title}". In 3-4 tight, specific sentences: what's most likely blocking my progress right now, and the single highest-leverage move to unblock it? No preamble.`) },
    { id: 'plan', ai: true, icon: <IconActivity size={15} />, label: 'Generate a plan', hint: 'A concrete 5-step plan', run: () => askCompanion(`Give me a concrete, sequenced 5-step plan to make real progress on: "${q.title}". Short lines, no preamble, no fluff.`) },
    { id: 'roadmap', ai: false, icon: <IconCompass size={15} />, label: 'View roadmap', hint: 'Open milestones', run: () => openRoadmap(q.id) },
  ];
}

// ─────────────────────────────────────────────────────────
// A single campaign — an interactive object.
//   tap        → expand/collapse the roadmap
//   long-press → contextual actions (AI breakdown, blockers, plan…)
// ─────────────────────────────────────────────────────────
function CampaignCard({ q, open, onToggleOpen, onToggleMilestone, onLongPress, menuOpen }) {
  const pct = questProgress(q);
  const next = nextMilestone(q);
  const lp = useLongPress(() => onLongPress(q), () => onToggleOpen(q.id));
  return (
    <div className={`press-soft${menuOpen ? ' obj-active obj-pulse' : ''}`} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${open ? 'var(--line-strong)' : 'var(--line)'}`, transition: 'border-color 200ms' }}>
      <div {...lp} className="pressable" style={{ touchAction: 'pan-y' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          {(() => { const K = domainIcon(q.domain); return <K size={16} color="var(--muted)" stroke={1.9} style={{ flexShrink: 0 }} />; })()}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--text)', lineHeight: 1.25, textWrap: 'pretty' }}>{q.title}</div>
            {!open && next && (
              <div className="mono" style={{ fontSize: 9, color: 'var(--cyan)', letterSpacing: '0.06em', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                ▸ {next.text}
              </div>
            )}
          </div>
          <span className="display" style={{ fontSize: 16, color: pct >= 60 ? 'var(--lime)' : 'var(--cyan)', flexShrink: 0 }}>{pct}%</span>
        </div>
        <div style={{ marginTop: 8 }}><ProgressBar value={pct} color={pct >= 60 ? 'var(--lime)' : 'var(--cyan)'} height={3} /></div>
      </div>
      {open && (
        <div className="unfold" style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {q.why && <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.4 }}>{q.why}</div>}
          {(q.milestones || []).map((m) => (
            <div key={m.id} className="pressable" onClick={() => {
              const completesCampaign = !m.done && (q.milestones || []).every((x) => x.id === m.id || x.done);
              onToggleMilestone(q.id, m.id);
              if (!m.done) {
                celebrate(); awardXp(15, 'milestone');
                if (completesCampaign) fireCeremony({ kicker: 'CAMPAIGN COMPLETE', title: q.title, subtitle: 'a goal, finished · your Self grows' });
              }
            }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 0', marginTop: -6, marginBottom: -6 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 6, flexShrink: 0,
                border: `1.5px solid ${m.done ? 'var(--lime)' : 'var(--line-strong)'}`,
                background: m.done ? 'var(--lime)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {m.done && <IconCheck size={11} color="#0A0B0D" stroke={3} />}
              </div>
              <span style={{ fontSize: 12.5, color: m.done ? 'var(--dim)' : 'var(--text)', textDecoration: m.done ? 'line-through' : 'none', lineHeight: 1.3 }}>{m.text}</span>
            </div>
          ))}
          <div className="mono" style={{ fontSize: 8.5, color: 'var(--dim)', letterSpacing: '0.1em', marginTop: 2 }}>HOLD FOR AI ACTIONS</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MISSIONS — the long campaigns (quest system). Each is an interactive
// object: tap to open the roadmap, long-press for AI actions.
// ─────────────────────────────────────────────────────────
function MissionsCard({ quests, onToggleMilestone, onNewGoal }) {
  const [openId, setOpenId] = useState(null);
  const [menuQuest, setMenuQuest] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const active = quests.filter((q) => questProgress(q) < 100);
  // Show a calm few by default; the rest are one tap away (density cut).
  const shown = showAll ? active : active.slice(0, 3);
  const openRoadmap = (id) => setOpenId((cur) => (cur === id ? cur : id));

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 'var(--space-3)' }}>
        <span className="eyebrow" style={{ color: 'var(--gold)' }}>Missions</span>
        <div className="row">
          <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>{active.length} campaigns</span>
          <div className="pressable" onClick={onNewGoal} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 'var(--r-pill)', background: 'rgba(69,183,232,0.12)', border: '1px solid rgba(69,183,232,0.4)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em' }}>
            <IconSparkles size={11} /> New goal
          </div>
        </div>
      </div>
      {active.length === 0 ? (
        <EmptyState title="No campaigns yet">Name a goal worth months of your life — the Self grows each time you close one of its milestones.</EmptyState>
      ) : (
        <>
          <div className="stack-2">
            {shown.map((q) => (
              <CampaignCard key={q.id} q={q} open={openId === q.id} menuOpen={menuQuest?.id === q.id}
                onToggleOpen={(id) => setOpenId(openId === id ? null : id)}
                onToggleMilestone={onToggleMilestone}
                onLongPress={setMenuQuest} />
            ))}
          </div>
          {active.length > 3 && (
            <div className="pressable center" onClick={() => setShowAll((s) => !s)}
              style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-body)', fontSize: 12, letterSpacing: '0.01em', fontWeight: 600, color: 'var(--cyan)' }}>
              {showAll ? 'Show less' : `Show all ${active.length}`}
            </div>
          )}
        </>
      )}

      <ObjectMenu
        open={!!menuQuest}
        onClose={() => setMenuQuest(null)}
        title={menuQuest?.title}
        subtitle={menuQuest ? `${questProgress(menuQuest)}% · ${(menuQuest.milestones || []).filter((m) => m.done).length}/${(menuQuest.milestones || []).length} milestones` : ''}
        accent="var(--cyan)"
        actions={menuQuest ? campaignActions(menuQuest, (id) => { openRoadmap(id); setMenuQuest(null); }) : []}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Recent wins — momentum is fuel. Surface it.
// ─────────────────────────────────────────────────────────
function WinsStrip({ wins }) {
  if (!wins.length) return null;
  return (
    <div className="card" style={{ borderColor: 'rgba(52,211,153,0.2)' }}>
      <span className="eyebrow" style={{ color: 'var(--lime)' }}>Recent wins</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {wins.map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCheck size={13} color="var(--lime)" stroke={2.4} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.3 }}>{w.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Ask bar — the door to the Intelligence, always one tap away.
// ─────────────────────────────────────────────────────────
function AskBar({ onOpen }) {
  return (
    <div className="pressable card" onClick={() => onOpen(false)} style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
      borderColor: 'rgba(45,212,191,0.3)',
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 9, background: 'linear-gradient(135deg, #2DD4BF, #45B7E8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B0D', flexShrink: 0 }}>
        <IconSparkles size={15} />
      </div>
      <span style={{ flex: 1, fontSize: 13.5, color: 'var(--muted)' }}>Ask your AI anything…</span>
      <div className="pressable" onClick={(e) => { e.stopPropagation(); onOpen(true); }} style={{
        width: 34, height: 34, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,107,91,0.1)', border: '1px solid rgba(255,107,91,0.35)', color: 'var(--ona-red)',
      }}>
        <IconMic size={17} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// L2 — Check-in (sets readiness, which re-plans the mission)
// ─────────────────────────────────────────────────────────
function StateCard({ state, onMeter, readiness, trend, onOpenSettings, momentum = [], streak = 0, freezes }) {
  const [open, setOpen] = useState(!state.checkedIn);
  const avail = freezes?.available ?? 0;
  return (
    <div className="card">
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="eyebrow">State</span>
          <span className="display" style={{ fontSize: 20, color: readiness >= 75 ? 'var(--lime)' : readiness >= 50 ? 'var(--gold)' : 'var(--ona-red)' }}>{readiness}</span>
          <span className="mono" style={{ fontSize: 9, color: 'var(--dim)', letterSpacing: '0.1em' }}>
            {trend == null ? 'Baseline' : `${trend >= 0 ? '▲+' : '▼'}${trend} vs 7d`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="pressable" onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
            style={{ width: 26, height: 26, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' }}>
            <IconSliders size={13} />
          </div>
          <IconChevronDown size={15} color="var(--muted)" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }} />
        </div>
      </div>
      {open && (
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {/* One accent per surface — meters share Command's cyan; level is read
              from the fill, not from four competing hues. */}
          <StateMeter label="Energy" value={state.energy} color="#45B7E8" onChange={(v) => onMeter('energy', v)} />
          <StateMeter label="Focus" value={state.focus} color="#45B7E8" onChange={(v) => onMeter('focus', v)} />
          <StateMeter label="Body" value={state.body} color="#45B7E8" onChange={(v) => onMeter('body', v)} />
          <StateMeter label="Mood" value={state.mood} color="#45B7E8" onChange={(v) => onMeter('mood', v)} />
        </div>
      )}

      {/* momentum lives with state — one calm region, not two cards */}
      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {momentum.map((v, i) => {
          const isToday = i === momentum.length - 1;
          const color = v === 0 ? '#5A5A66' : v === 1 ? '#1E6F9F' : v === 2 ? '#45B7E8' : v === 3 ? '#E9C46A' : '#34D399';
          return (
            <div key={i} style={{
              flex: 1, height: 20, borderRadius: 5, background: color,
              opacity: v === 0 ? 0.12 : 0.3 + (v / 4) * 0.7,
              border: isToday ? '1.5px solid rgba(255,255,255,0.8)' : 'none',
            }} />
          );
        })}
      </div>
      <div className="row-between" style={{ marginTop: 8 }}>
        <span className="mono" style={{ fontSize: 9.5, color: streak > 0 ? 'var(--gold)' : 'var(--dim)' }}>
          {streak > 0 ? `${streak}-day streak` : 'no streak yet'}
          {avail > 0 && <span style={{ color: 'var(--cyan)' }}> · ❄{avail}</span>}
        </span>
        <span className="mono" style={{ fontSize: 9, color: 'var(--dim)' }}>14d</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// L3 — Later today (timeline, collapsed by default)
// ─────────────────────────────────────────────────────────
const TL_CATEGORIES = [
  { kind: 'Body', color: '#45B7E8' }, { kind: 'Create', color: '#FF8A4C' },
  { kind: 'Train', color: '#F4A261' }, { kind: 'ONA', color: '#34D399' },
  { kind: 'Acro', color: '#2DD4BF' }, { kind: 'Focus', color: '#FF6B5B' },
];

function TimelineCard({ events, calendarEvents = [], onAdd, onDelete, onOpenCalendar }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [cat, setCat] = useState(0);

  const calItems = calendarEvents.map((e) => ({ time: e.time, label: e.label, color: '#45B7E8', kind: 'CAL', cal: true }));
  const manualItems = events.map((e, i) => ({ ...e, cal: false, _idx: i }));
  const sortKey = (t) => (t === 'all-day' ? '00:00' : t);
  const combined = [...calItems, ...manualItems].sort((a, b) => sortKey(a.time).localeCompare(sortKey(b.time)));

  const submit = () => {
    if (!label.trim()) return;
    const c = TL_CATEGORIES[cat];
    onAdd({ time: time.trim() || '12:00', label: label.trim(), kind: c.kind, color: c.color });
    setTime(''); setLabel(''); setCat(0); setAdding(false);
  };

  return (
    <div className="hud glass" style={{ padding: '13px 14px', borderRadius: 16 }}>
      <div className="pressable" onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="eyebrow">Later today</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{combined.length} BLOCKS{calItems.length ? ' · SYNCED' : ''}</span>
        </div>
        <IconChevronDown size={15} color="var(--muted)" style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 200ms' }} />
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <div className="pressable" onClick={onOpenCalendar} style={{
              flex: 1, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 11, fontWeight: 600,
            }}><IconCalendar size={14} /> Calendar</div>
            <div className="pressable" onClick={() => setAdding((a) => !a)} style={{
              flex: 1, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: adding ? 'rgba(255,255,255,0.05)' : 'rgba(69,183,232,0.1)',
              border: `1px solid ${adding ? 'var(--line-strong)' : 'rgba(69,183,232,0.35)'}`,
              color: adding ? 'var(--muted)' : 'var(--cyan)', fontSize: 11, fontWeight: 600,
            }}>{adding ? <IconClose size={13} /> : <IconPlus size={14} />} Block</div>
          </div>

          {adding && (
            <div style={{ marginBottom: 12, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="06:30"
                  style={{ width: 64, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 9px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
                <input value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="What's happening?"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)' }} />
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                {TL_CATEGORIES.map((c, i) => (
                  <div key={c.kind} className="pressable" onClick={() => setCat(i)} style={{
                    padding: '4px 8px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: cat === i ? `${c.color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${cat === i ? c.color + '90' : 'var(--line)'}`, color: cat === i ? c.color : 'var(--muted)',
                  }}>{c.kind}</div>
                ))}
              </div>
              <div className="pressable" onClick={submit} style={{ height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #45B7E8, #2DD4BF)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#0A0B0D', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <IconPlus size={14} stroke={2.4} /> Add
              </div>
            </div>
          )}

          {combined.length === 0 && (
            <div className="eyebrow" style={{ color: 'var(--dim)', padding: '6px 0' }}>Nothing scheduled — your time is yours to direct.</div>
          )}
          {combined.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <TimelineEvent time={e.time} label={e.label} color={e.color} kind={e.kind} last={i === combined.length - 1} />
              </div>
              {!e.cal && (
                <div className="pressable" onClick={() => onDelete(e._idx)} style={{
                  width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 2,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)',
                }}><IconClose size={12} /></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// The screen
// ─────────────────────────────────────────────────────────
export function TodayScreen({
  state, setState, missions, doneIds, adaptedAt, onToggleMission, onRegenerate,
  momentum, streak, freezes, becoming, trend, icalUrl,
  onOpenSettings, onOpenCalendar, onOpenCompanion, onGoTab,
}) {
  const setMeter = (k, v) => setState((s) => ({ ...s, [k]: v, checkedIn: true }));
  const readiness = Math.round(((state.energy + state.focus + state.body + state.mood) / 40) * 100);

  // Quest system — the long campaigns behind the daily mission.
  const [quests, setQuests] = useSyncedState('lifeos:quests', SEED_QUESTS);
  const toggleMilestone = (qid, mid) => setQuests((list) => list.map((q) => (
    q.id !== qid ? q : {
      ...q,
      milestones: (q.milestones || []).map((m) => (m.id === mid ? { ...m, done: !m.done, doneAt: !m.done ? Date.now() : undefined } : m)),
    }
  )));

  // Goal decomposition — name a goal, AI breaks it into a campaign.
  const [goalOpen, setGoalOpen] = useState(false);
  const addQuest = (q) => setQuests((list) => [q, ...list]);

  // Recent wins — computed fresh each open (cheap, local). Becoming comes from
  // App as a single source of truth so the number matches every screen.
  const [wins, setWins] = useState([]);
  useEffect(() => {
    try { setWins(recentWins()); } catch { /* first run */ }
  }, [doneIds, quests]);

  // The identity milestone closest to unlocking (permanent once earned) —
  // feeds the Presence so the day's nudge can name an identity within reach.
  const [milestoneRecord] = useSyncedState('lifeos:milestones', {});
  const nearMilestone = useMemo(() => {
    try {
      const list = evaluateMilestones({ becoming })
        .map((m) => ({ ...m, done: m.done || !!milestoneRecord[m.id] }))
        .filter((m) => !m.done);
      return list.sort((a, b) => b.progress - a.progress)[0] || null;
    } catch { return null; }
  }, [becoming, milestoneRecord]);

  // Life Level for The Self on the Bridge (same number shown on the Map).
  const lvl = useMemo(() => { try { return lifeLevel(); } catch { return null; } }, [doneIds, missions]);

  // Data provenance — until the setup flow has run, the numbers are seed.
  const [setupDone] = useSyncedState('lifeos:setup-complete', null);

  // The Presence — one proactive, unasked observation.
  const allDoneToday = missions.length > 0 && missions.every((m) => doneIds.includes(m.id));
  const insight = useMemo(() => {
    try { return proactiveInsight({ oneThing: state.oneThing, allDone: allDoneToday, becoming, quests, nearMilestone }); } catch { return null; }
  }, [state.oneThing, allDoneToday, becoming, quests, nearMilestone]);

  // The Oracle's whisper — the day's model-authored Presence line, broadcast
  // by ChiefBrief (one AI call/day powers both). Heuristics remain the
  // instant/offline fallback.
  const [oracleWhisper, setOracleWhisper] = useState('');
  useEffect(() => {
    const on = (e) => { if (e.detail?.whisper) setOracleWhisper(e.detail.whisper); };
    window.addEventListener('jamhq:oracle', on);
    return () => window.removeEventListener('jamhq:oracle', on);
  }, []);

  // Real calendar events for today (read-only).
  const [calendarEvents, setCalendarEvents] = useState([]);
  useEffect(() => {
    if (!icalUrl) { setCalendarEvents([]); return; }
    let active = true;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const n = new Date();
    const date = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    fetch(`/api/calendar?url=${encodeURIComponent(icalUrl)}&tz=${encodeURIComponent(tz)}&date=${date}`)
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d) => { if (active) setCalendarEvents(d.events || []); })
      .catch(() => { if (active) setCalendarEvents([]); });
    return () => { active = false; };
  }, [icalUrl]);

  const events = state.timeline ?? TIMELINE;
  const addEvent = (ev) => setState((s) => ({ ...s, timeline: [...(s.timeline ?? TIMELINE), ev].sort((a, b) => a.time.localeCompare(b.time)) }));
  const deleteEvent = (idx) => setState((s) => ({ ...s, timeline: (s.timeline ?? TIMELINE).filter((_, i) => i !== idx) }));

  const goMission = (m) => {
    if (m.kind === 'focus') return; // the One Thing lives here
    onGoTab?.(m.go);
  };

  return (
    <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <MissionCard
        missions={missions}
        doneIds={doneIds}
        onToggle={onToggleMission}
        onRegenerate={onRegenerate}
        readiness={readiness}
        streak={streak}
        onGo={goMission}
        oneThing={state.oneThing}
        onSetOneThing={(txt) => setState((s) => ({ ...s, oneThing: txt }))}
        becoming={becoming}
        level={lvl?.level}
        adaptedAt={adaptedAt}
        starterData={!setupDone}
        onCalibrate={onOpenSettings}
      />

      <AskBar onOpen={onOpenCompanion} />

      {insight && (
        <div className="pressable" onClick={onOpenCompanion} style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', borderRadius: 14,
          background: 'rgba(69,183,232,0.05)', border: '1px solid rgba(69,183,232,0.22)', marginTop: -4,
        }}>
          <span className="blink" style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--cyan)', marginTop: 5, flexShrink: 0, boxShadow: '0 0 8px var(--cyan)' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow" style={{ fontSize: 9, color: 'var(--cyan)', marginBottom: 3 }}>{!oracleWhisper && insight.milestone ? 'Presence · identity within reach' : 'Presence'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.42, textWrap: 'pretty' }}>{oracleWhisper || insight.text}</div>
            {!oracleWhisper && insight.milestone && (
              <div style={{ marginTop: 8 }}>
                <ProgressBar value={insight.milestone.progress} color={insight.milestone.accent || '#45B7E8'} height={3} />
              </div>
            )}
          </div>
          <IconChevronRight size={14} color="var(--dim)" style={{ flexShrink: 0, marginTop: 3 }} />
        </div>
      )}

      <CloseDay
        state={state}
        setState={setState}
        doneCount={missions.filter((m) => doneIds.includes(m.id)).length}
        totalCount={missions.length}
        becoming={becoming}
        streak={streak}
      />

      <MissionsCard quests={quests} onToggleMilestone={toggleMilestone} onNewGoal={() => setGoalOpen(true)} />

      <GoalDecomposer open={goalOpen} onClose={() => setGoalOpen(false)} onAddQuest={addQuest} />

      <StateCard state={state} onMeter={setMeter} readiness={readiness} trend={trend} onOpenSettings={onOpenSettings}
        momentum={momentum} streak={streak} freezes={freezes} />

      <WinsStrip wins={wins} />

      <ChiefBrief
        readiness={readiness}
        oneThing={state.oneThing}
        calendarEvents={calendarEvents}
        streak={streak}
        nearMilestone={nearMilestone}
        onAddEvent={addEvent}
        onGoMind={() => onGoTab?.('life')}
        defaultOpen={true}
      />

      <TimelineCard events={events} calendarEvents={calendarEvents} onAdd={addEvent} onDelete={deleteEvent} onOpenCalendar={onOpenCalendar} />
    </div>
  );
}
