// ─────────────────────────────────────────────────────────
// Coaching knowledge layer — the brain behind Jay's elite coach.
// Per-discipline tier DRILLS, the cross-discipline athletic
// FOUNDATIONS most movement athletes neglect, and a blindspot
// analyzer that reads his skill tree + recent training + readiness
// to catch what's holding him back from being a well-rounded,
// durable, elite all-around acrobat.
//
// Sources of truth: artistic gymnastics & tumbling progressions,
// FIG-style body-line work, hand-balancing & partner-acro methodology,
// calisthenics/street-workout straight-arm strength science, tricking
// (flips/twists) air-awareness drills, parkour landing/precision
// fundamentals, and ninja grip/lache training — plus sports science
// (periodization, eccentric/landing mechanics, tissue prep).
// ─────────────────────────────────────────────────────────

// ── Drills keyed by discipline → tier. Each: a concrete drill + the
//    cue that makes it work. Train these to earn the skills in the tree.
export const DRILLS = {
  gymnastics: {
    Foundation: [
      { name: 'Wall handstand holds (chest-to-wall)', cue: 'Ribs down, push tall, stack wrist–shoulder–hip; build to 60s.' },
      { name: 'Hollow & arch rocks', cue: 'Low back glued in hollow; squeeze the line — this is every skill later.' },
      { name: 'Bridge / backbend holds', cue: 'Push through shoulders, open thoracic not just low back.' },
    ],
    Developing: [
      { name: 'Freestanding HS — wall walks + toe pulls', cue: 'Find balance with fingertips; fail forward, not banana.' },
      { name: 'Round-off rebound to back', cue: 'Snap heels down, punch the floor, stay tall on rebound.' },
      { name: 'Straddle/pike press negatives', cue: 'Slow lower from HS, lean shoulders past hands, compress.' },
    ],
    Advanced: [
      { name: 'Back handspring over barrel → spotted', cue: 'Jump back not up, blind reach, push through shoulders.' },
      { name: 'Limber → walkover', cue: 'Open shoulders early, split the legs, lead with the chest.' },
      { name: 'Press-to-handstand drills', cue: 'Straight-arm, compression-driven; no swing.' },
    ],
    Elite: [
      { name: 'Back tuck: set + jump backward off box', cue: 'Full set (arms up, tall) BEFORE the tuck — height then rotation.' },
      { name: 'Layout / whip line drills', cue: 'Hollow-arch-hollow; drive hips, delay the open.' },
      { name: 'One-arm HS leans & shifts', cue: 'Shift weight over one hand, hips stacked, micro-fingers.' },
    ],
  },
  tricking: {
    Foundation: [
      { name: 'Kick technique — round / hook / tornado', cue: 'Chamber, snap, retract; balance on the base leg.' },
      { name: 'Pop 360 & j-step setups', cue: 'Vertical pop, late twist; spot the landing early.' },
      { name: 'Cartwheel / round-off entries', cue: 'Clean setups feed every flip — make them automatic.' },
    ],
    Developing: [
      { name: 'Btwist off elevation', cue: 'Backside takeoff, set vertical, twist late and tight.' },
      { name: 'Aerial (no-hand cartwheel) off a box', cue: 'Reach long, hollow body, kick-punch the legs.' },
      { name: 'Cheat 720 progressions', cue: 'Cheat the setup, stay over the base, finish the rotation.' },
    ],
    Advanced: [
      { name: 'Cork off box → flat ground', cue: 'Hurdle, set low, dump the head late — air-awareness first.' },
      { name: 'Gainer off elevation', cue: 'Travel forward, flip backward; spot the takeoff foot.' },
      { name: 'Raiz / touchdown raiz reps', cue: 'Inverted cartwheel feel, snap the legs, tall finish.' },
    ],
    Elite: [
      { name: 'Double cork into pit / tramp', cue: 'Earn the double off the single — set high, two tight rotations.' },
      { name: 'Cork variations (hook / swipe / touch)', cue: 'Own the base cork before flavoring it.' },
      { name: 'Full-twisting layouts', cue: 'Late twist, hold the line, complete rotation before opening.' },
    ],
  },
  calisthenics: {
    Foundation: [
      { name: 'Scap pulls + scap pushups', cue: 'Move the shoulder blades first — protraction/retraction control.' },
      { name: 'Hollow-body holds & rows', cue: 'Build the line and pulling base; balance push with pull.' },
      { name: 'Pistol & squat progressions', cue: "Don't skip legs — single-leg strength + ankle depth." },
    ],
    Developing: [
      { name: 'Tuck front-lever holds + raises', cue: 'Straight arms, posterior pelvic tilt, pull the bar to hips.' },
      { name: 'Explosive pull-ups → MU transition', cue: 'Pull high to the navel, fast turnover over the bar.' },
      { name: 'Wall HSPU + L-sit compression', cue: 'Full ROM overhead; active compression for the L-sit.' },
    ],
    Advanced: [
      { name: 'Planche leans → tuck → straddle', cue: 'Lean past the wrists, scapula protracted, lock straight arms.' },
      { name: 'Full front-lever raises & pulls', cue: 'Stay rigid hollow; pull from straight-arm lats.' },
      { name: 'Human flag progressions', cue: 'Top arm pulls, bottom arm presses; stack and brace.' },
    ],
    Elite: [
      { name: 'Planche pushups & full holds', cue: 'Straight-arm strength is connective tissue — load it patiently.' },
      { name: 'One-arm pull-up progressions', cue: 'Archer → assisted → weighted negatives; build the elbow.' },
      { name: '90° / full planche pushups', cue: 'Protect the elbow; ramp volume slowly.' },
    ],
  },
  acro: {
    Foundation: [
      { name: 'Handstand endurance + line', cue: 'Your base is your handstand — own a 30–60s straight HS.' },
      { name: 'Partner counterbalances', cue: 'Trust the lean, opposing tension, slow and controlled.' },
      { name: 'Foot-to-hand setups (L-base)', cue: 'Stack flyer over base hips, locked arms, vertical load.' },
    ],
    Developing: [
      { name: 'Shoulder stand → 2-high', cue: 'Base braces overhead; flyer finds the line tall and quiet.' },
      { name: 'Whip-up to foot-to-hand', cue: 'Time the dip-drive; flyer stays hollow and patient.' },
      { name: 'Low hand-to-hand entries', cue: 'Wrist-to-wrist, stacked bones, micro-balance with fingers.' },
    ],
    Advanced: [
      { name: 'Hand-to-hand (H2H) holds', cue: 'Straight-arm base, flyer line over base shoulders, breathe.' },
      { name: 'Partner press / pop-ups', cue: 'Drive through the legs, sync the count, soft catches.' },
      { name: 'Dynamic washing-machines', cue: 'Continuous tension, smooth transitions, eyes up.' },
    ],
    Elite: [
      { name: 'Standing hand-to-hand', cue: 'Earn it off low H2H + bulletproof handstand; tiny corrections.' },
      { name: 'Dynamic pitches & tempo', cue: 'Commit fully, time the catch, control the landing arc.' },
      { name: 'One-arm flag / advanced lines', cue: 'Built on years of straight-arm and balance — patience.' },
    ],
  },
  parkour: {
    Foundation: [
      { name: 'Depth landings + rolls', cue: 'Quiet, absorb through ankle-knee-hip; roll off the shoulder.' },
      { name: 'Precision jumps (accuracy ladder)', cue: 'Stick the rail/edge, arms set the balance, no wobble.' },
      { name: 'Quadrupedal & vaults (safety/lazy)', cue: 'Move efficiently; hands light, eyes ahead.' },
    ],
    Developing: [
      { name: 'Kong vault — progressive depth', cue: 'Dive early, push off long, tuck knees through the hands.' },
      { name: 'Cat leap → climb-up', cue: 'Absorb on the wall, pull and rotate over the top.' },
      { name: 'Wall run height ladder', cue: 'Run up, drive the knee, reach tall; build height safely.' },
    ],
    Advanced: [
      { name: 'Kong precision (flat → gap)', cue: 'Control the float, spot the landing, stick it quiet.' },
      { name: 'Running precisions on rails', cue: 'Rhythm and confidence; commit to the stick.' },
      { name: 'Palm spin / wall-flip intro (matted)', cue: 'Air-awareness first; build off elevation.' },
    ],
    Elite: [
      { name: 'Wall flips & wall gainers', cue: 'Earn off tricking flips + wall runs; commit, spot, land soft.' },
      { name: 'Big lines & dynamic combos', cue: 'Flow under fatigue; scout, rehearse segments, then link.' },
      { name: 'High-consequence precisions', cue: 'Only when the move is 100% on the ground first.' },
    ],
  },
  ninja: {
    Foundation: [
      { name: 'Dead hangs + towel/pinch hangs', cue: 'Grip is the gatekeeper — build hang time and finger strength.' },
      { name: 'Lache swing to catch', cue: 'Swing from the shoulders, time the release at the peak.' },
      { name: 'Pull strength + scapular control', cue: 'Foundational pulling carries every obstacle.' },
    ],
    Developing: [
      { name: 'Lache distance ladder', cue: 'Generate from the swing, release late, catch soft and regrip.' },
      { name: 'Warped wall run-ups', cue: 'Attack the wall, last steps high, reach long at the top.' },
      { name: 'Grip transitions (cannonball/lap bar)', cue: 'Smooth re-grips; never death-grip — relax between holds.' },
    ],
    Advanced: [
      { name: 'Cliffhanger / ledge traverse', cue: 'Fingertip strength + body tension; move from the back.' },
      { name: 'Salmon ladder pops', cue: 'Explosive kip, drive the bar up, control the catch.' },
      { name: 'Pegboard / dynamic grip', cue: 'Tight core, deliberate placements, save the forearms.' },
    ],
    Elite: [
      { name: 'Ultimate cliffhanger / floating boards', cue: 'Max fingertip + lache precision under fatigue.' },
      { name: 'Devil steps & comp combos', cue: 'Train the full sequence; pace the grip across the course.' },
      { name: 'Competition-pace circuits', cue: 'Grip endurance is the limiter — train it fresh and fatigued.' },
    ],
  },
};

// ── The athletic foundations under everything. Most movement athletes
//    obsess over skills and quietly neglect these — which is exactly
//    where injuries and plateaus come from.
export const FOUNDATIONS = [
  { id: 'wrist', name: 'Wrist & elbow prep', why: 'Hand-balancing, planche, and tumbling load the wrists/elbows hard. Skip prep and you get tendinopathy that sidelines everything.', drills: ['Wrist CARs + flexor/extensor curls', 'Knuckle & fingertip pushups', 'Tiger-bend & elbow-pit conditioning'] },
  { id: 'shoulder', name: 'Shoulder & scapular strength + mobility', why: 'Overhead line, straight-arm strength, and catches all live here. Weak/locked shoulders cap your handstand and your acro base.', drills: ['Scap CARs + Y/T/W raises', 'German hang + shoulder dislocates', 'Overhead support holds'] },
  { id: 'spine', name: 'Thoracic & spinal mobility', why: 'Bridges, walkovers, aerials, and a tall line need an open thoracic — not just a cranky low back doing all the bending.', drills: ['Bridge progressions / wall walks', 'Jefferson curls (light, slow)', 'Segmental cat-cow + thoracic CARs'] },
  { id: 'hips', name: 'Hip & ankle mobility', why: 'Splits and pancake feed kicks, presses, and clean lines; ankle dorsiflexion = depth and soft landings.', drills: ['Front + middle split work', 'Pancake / Cossack squats', 'Banded ankle dorsiflexion'] },
  { id: 'straightarm', name: 'Straight-arm / connective-tissue strength', why: 'Planche, levers, presses, and acro bases are built on straight-arm strength — tendons adapt slowly, so this is the long game.', drills: ['Planche & lever leans', 'Tuck planche / tuck FL holds', 'Pseudo-planche pushups'] },
  { id: 'pull', name: 'Pull / push balance', why: 'Trickers and handbalancers over-push and under-pull. Imbalance wrecks shoulders and stalls progress. Match your pressing with pulling.', drills: ['Weighted pull-ups & rows', 'Front-lever pulls', 'Face-pulls / band pull-aparts'] },
  { id: 'posterior', name: 'Posterior chain & legs', why: 'Jumps, kicks, sets, and landings come from hamstrings, glutes, and calves. Skinny-leg syndrome limits height and risks the knees.', drills: ['Nordic hamstring curls', 'Single-leg RDL + squat', 'Pogo / depth-jump landings'] },
  { id: 'core', name: 'Core line & compression', why: 'Hollow/arch control and active compression are the through-line of every skill — the difference between a clean line and a banana.', drills: ['Hollow rocks + arch holds', 'V-ups / pike compressions', 'Copenhagen + anti-rotation'] },
  { id: 'landing', name: 'Landing & eccentric control', why: 'The most-skipped pillar and the #1 injury source. Train absorbing force — your knees, ankles, and longevity depend on it.', drills: ['Depth landings (stick + absorb)', 'Eccentric step-downs', 'Roll mechanics on all sides'] },
  { id: 'capacity', name: 'Work capacity & recovery', why: 'Ninja/parkour fail late from fatigue, not lack of skill. Build the engine — and respect recovery so adaptation actually happens.', drills: ['Grip & circuit conditioning', 'Zone-2 base + short intervals', 'Sleep, fuel, deload weeks'] },
];

// ── Blindspot analyzer. Reads the skill tree + recent sessions +
//    readiness and returns the gaps an elite coach would call out.
const TIER_ORDER = { Foundation: 0, Developing: 1, Advanced: 2, Elite: 3 };

export function analyzeBlindspots(skills, sessions = [], readiness = null, disciplines = []) {
  const flags = [];
  const now = Date.now();
  const recent = (sessions || []).filter((s) => new Date(s.date || s.ts || 0).getTime() >= now - 21 * 864e5);
  const trained = new Set(recent.map((s) => s.discipline));
  const discList = disciplines.length ? disciplines : Object.keys(skills || {}).map((id) => ({ id, name: id }));

  // 1. No recent training at all.
  if (recent.length === 0) {
    flags.push({ sev: 'high', title: 'No sessions logged recently', detail: 'Nothing in the last 3 weeks — momentum and tissue resilience fade fast.', fix: 'Log even one session; consistency beats intensity for skill retention.' });
  }

  // 2. Neglected disciplines (have active work but untrained lately).
  for (const d of discList) {
    const list = (skills && skills[d.id]) || [];
    const hasWork = list.some((s) => s.status === 'active');
    if (hasWork && recent.length > 0 && !trained.has(d.id)) {
      flags.push({ sev: 'med', title: `Neglecting ${d.name}`, detail: `You have active skills in ${d.name} but haven't trained it in 3 weeks.`, fix: `Slot a short ${d.name} block in this week to keep the progression alive.` });
    }
  }

  // 3. Foundation gaps — building advanced skills on incomplete basics.
  for (const d of discList) {
    const list = (skills && skills[d.id]) || [];
    const foundationsDone = list.filter((s) => s.tier === 'Foundation').every((s) => s.status === 'done');
    const reachingHigh = list.some((s) => (s.status === 'active' || s.status === 'done') && TIER_ORDER[s.tier] >= 2);
    const foundationsExist = list.some((s) => s.tier === 'Foundation');
    if (foundationsExist && !foundationsDone && reachingHigh) {
      flags.push({ sev: 'high', title: `Shaky foundation in ${d.name}`, detail: `You're working advanced ${d.name} skills while Foundation-tier skills aren't locked in.`, fix: 'Re-earn the foundation — it removes the ceiling and the injury risk on the hard stuff.' });
    }
  }

  // 4. Training monotony — only one discipline recently.
  if (recent.length >= 4 && trained.size === 1) {
    const only = discList.find((d) => d.id === [...trained][0]);
    flags.push({ sev: 'med', title: 'Training monotony', detail: `Recent work is all ${only?.name || 'one discipline'} — overloads the same tissue and stalls all-around development.`, fix: 'Rotate stimulus: pair your main focus with a contrasting discipline or a mobility/strength day.' });
  }

  // 5. Readiness / recovery.
  if (readiness != null && readiness < 55) {
    flags.push({ sev: 'med', title: 'Under-recovered', detail: `Readiness is ${readiness}/100 — pushing max skills now risks injury and poor motor learning.`, fix: 'Make today technical and low-impact; prioritize sleep, fuel, and mobility.' });
  }

  // 6. Always-on coachable reminder: rotate a neglected foundation pillar.
  const foundationNudge = FOUNDATIONS[(Math.floor(now / 864e5)) % FOUNDATIONS.length];
  flags.push({ sev: 'low', title: `Don't skip: ${foundationNudge.name}`, detail: foundationNudge.why, fix: foundationNudge.drills.join(' · ') });

  return flags;
}

// Pull the drills for a discipline + tier (used by the skill tree + coach).
export function drillsFor(disciplineId, tier) {
  return (DRILLS[disciplineId] && DRILLS[disciplineId][tier]) || [];
}
