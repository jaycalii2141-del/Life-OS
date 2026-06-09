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

// ── Drills keyed by discipline → tier. Each tier is an ORDERED teaching
//    sequence — do them top to bottom; each builds on the last. Every
//    drill has a `cue` (the coaching key) and a `gate` (the measurable
//    standard that means you've earned the next step). Don't chase the
//    skill before the gate before it is green.
export const DRILLS = {
  gymnastics: {
    // Shapes → static handstand → basic rotation. Everything later is these.
    Foundation: [
      { name: '1. Body-line holds: hollow → arch', cue: 'Posterior pelvic tilt + low back glued in hollow; glutes on, ribs in for arch. These two shapes ARE gymnastics.', gate: '30s clean hollow + 30s arch, no breaks.' },
      { name: '2. Hollow & arch rocks', cue: 'Rock from one rigid shape; no bend at the hips, no flailing.', gate: '20 controlled reps each, line held.' },
      { name: '3. Chest-to-wall handstand', cue: 'Stomach to wall, push tall through shoulders, ribs down, hips stacked over hands.', gate: '60s chest-to-wall, ears covered.' },
      { name: '4. Back-to-wall HS + shoulder taps', cue: 'Find the balance line off the wall; alternate light, controlled taps.', gate: '10 controlled taps each shoulder.' },
      { name: '5. Forward/back rolls + candlestick to stand', cue: 'Round the spine, stay tight, no hands on the stand.', gate: 'Smooth roll to stand both directions.' },
    ],
    // Freestanding balance → round-off power → back flexibility → press strength.
    Developing: [
      { name: '1. Freestanding HS balance (toe pulls, fingers)', cue: 'Balance from the fingertips, not the hips; if you fall, fall forward — never banana.', gate: '30s freestanding handstand.' },
      { name: '2. Cartwheel → round-off technique', cue: 'Hand–hand–foot–foot, snap the heels down, finish tall and square.', gate: 'Powerful RO to two feet, chest up.' },
      { name: '3. Round-off rebound', cue: 'Punch the floor, rebound up and slightly back, arms locked by the ears.', gate: 'Tall rebound, hips open, stuck.' },
      { name: '4. Bridge → bridge kick-over (limber prep)', cue: 'Push to fingertips toward the heels; shift shoulders past the hands.', gate: 'Straight-arm bridge, shoulders open over hands.' },
      { name: '5. Straddle/pike press negatives', cue: 'Lower slowly from HS — lean shoulders forward, compress, straight arms, no swing.', gate: '5 slow controlled negatives.' },
    ],
    // Back flexibility skills → BHS → press strength → straight-arm crossover.
    Advanced: [
      { name: '1. Front & back walkovers', cue: 'Lead with the chest, split the legs, open the shoulders early.', gate: 'Controlled walkover both directions.' },
      { name: '2. BHS over a barrel / to spotter', cue: 'Sit and jump BACKWARD (not up), blind reach, push through the shoulders, snap down.', gate: 'Back handspring over barrel solo.' },
      { name: '3. Standing BHS → step-out', cue: 'Keep the set tall; connect into a controlled step-out.', gate: 'Standing BHS stuck, no spot.' },
      { name: '4. Straddle → pike press to handstand', cue: 'Straight-arm, hips lead, compression-driven — zero swing.', gate: 'Straddle press to HS.' },
      { name: '5. Planche lean → tuck planche', cue: 'Protract the scapula, lean past the wrists, lock straight arms.', gate: '10s tuck planche.' },
    ],
    // Air-awareness off height → flat → line skills → one-arm balance.
    Elite: [
      { name: '1. Back tuck: set + jump back off raised mat → into soft', cue: 'Full arm set and tall jump BACKWARD before you tuck — height first, then rotation; spot the floor coming down.', gate: 'Back tuck into pit/resi, consistent.' },
      { name: '2. Standing back tuck on flat', cue: 'Same set; commit, snap the tuck, open to spot the landing.', gate: 'Standing back tuck stuck on flat.' },
      { name: '3. Whip → layout line drills', cue: 'Hollow–arch–hollow; drive the hips, delay the open.', gate: 'Whip-back with a tight, traveling line.' },
      { name: '4. One-arm HS: weight shift → leans → brief OAHS', cue: 'Shift hips over one hand, square the shoulders, all corrections from the fingers.', gate: '3–5s one-arm handstand.' },
    ],
  },
  tricking: {
    // Kicks + clean setups are non-negotiable before any flip.
    Foundation: [
      { name: '1. Technical & stretch kicks (round, hook, crescent)', cue: 'Chamber, snap, retract; stay tall and balanced on the base leg.', gate: 'Balanced controlled kicks both legs.' },
      { name: '2. Pop 360 → 540 (tornado kick)', cue: 'Vertical pop, spot early, late kick; land on the kicking leg.', gate: 'Clean pop 540, landed in control.' },
      { name: '3. Setups: cartwheel, round-off, J-step, hyper-hook', cue: 'Master the entries — sloppy setups cap every flip you ever learn.', gate: 'Consistent J-step / round-off into vertical.' },
    ],
    // First inverts & twists, learned OFF elevation for air-awareness, then flat.
    Developing: [
      { name: '1. Aerial (no-hand cartwheel) off a box → flat', cue: 'Reach long over the lead leg, hollow body, kick-punch the legs through.', gate: 'Aerial stuck on flat ground.' },
      { name: '2. Btwist (cartwheel-twist) off elevation → flat', cue: 'Backside takeoff, set vertical, twist late and tight.', gate: 'Btwist landed on flat.' },
      { name: '3. Masterscoops / swing-throughs', cue: 'Build momentum and rotation control before adding gainers and corks.', gate: 'Smooth swing-through to set up flips.' },
    ],
    // First true flips: gainer (forward travel) and cork (off-axis), height → flat.
    Advanced: [
      { name: '1. Gainer off elevation → flat', cue: 'Travel forward off one leg, flip backward; spot the takeoff foot.', gate: 'Gainer landed on flat.' },
      { name: '2. Cork off box → into mat → flat', cue: 'Hurdle, set LOW and diagonal, dump the head late, complete the rotation before opening.', gate: 'Cork landed feet-first on flat.' },
      { name: '3. Raiz / touchdown raiz', cue: 'Inverted-cartwheel feel, snap the legs through, finish tall.', gate: 'Raiz stuck, chest up.' },
    ],
    // Own the base cork, then flavor it, then double.
    Elite: [
      { name: '1. Cork variations (hook, swipe, touchdown)', cue: 'Own the clean base cork before adding any flavor.', gate: '2–3 cork variations landed clean.' },
      { name: '2. Double cork into pit/tramp → resi → flat', cue: 'Set higher off the single, two tight rotations, eyes find the floor early.', gate: 'Double cork into soft consistently.' },
      { name: '3. Full-twisting layouts & combos', cue: 'Late twist, hold the line, complete rotation before opening; link only what is automatic.', gate: 'Full landed; clean 3-trick combo.' },
    ],
  },
  calisthenics: {
    // Scap control + full-ROM basics + legs. Build the pulling base early.
    Foundation: [
      { name: '1. Scap pulls / pushups / dips', cue: 'Move the shoulder blades FIRST — own protraction, retraction, depression.', gate: '10 controlled reps of each.' },
      { name: '2. Full-ROM pull-ups, dips, pushups, rows', cue: 'Build strict strength and BALANCE pushing with pulling from day one.', gate: '10 pull-ups · 15 dips · 20 pushups · 10 rows, strict.' },
      { name: '3. Pistol squat + Nordic curl progression', cue: "Don't be all upper body — single-leg strength + hamstring eccentric protect the knees.", gate: 'Clean pistol each leg; 1/2-range Nordic.' },
    ],
    // Tuck statics + the muscle-up + compression/overhead.
    Developing: [
      { name: '1. Tuck front-lever hold → raises', cue: 'Straight arms, posterior pelvic tilt, pull the bar toward the hips.', gate: '10s tuck FL + 5 raises.' },
      { name: '2. Explosive pull-ups → negative MU → muscle-up', cue: 'Pull high to the navel, fast turnover, keep the bar path tight.', gate: '3 clean bar muscle-ups.' },
      { name: '3. L-sit + wall HSPU', cue: 'Active compression for the L-sit; full range overhead on the HSPU.', gate: '15s L-sit · 5 wall HSPU full ROM.' },
    ],
    // Open the levers to straddle; planche from leans; freestanding press.
    Advanced: [
      { name: '1. Adv-tuck → straddle front lever', cue: 'Open the tuck slowly; arms straight, body rigid-hollow the whole time.', gate: '5s straddle front lever.' },
      { name: '2. Planche: leans → tuck → adv-tuck → straddle', cue: 'Lean past the wrists, scapula protracted, straight arms — tendons adapt slowly, be patient.', gate: '10s advanced-tuck planche.' },
      { name: '3. Freestanding HSPU + human flag', cue: 'Top arm pulls, bottom arm presses; stack and brace the whole body.', gate: 'Freestanding HSPU; 5s flag.' },
    ],
    // Full statics and one-arm strength — connective-tissue patience.
    Elite: [
      { name: '1. Full front lever → pulls/touches', cue: 'Rigid hollow line, pull from straight-arm lats.', gate: 'Full FL 5s hold.' },
      { name: '2. Full planche → planche pushups', cue: 'Straight-arm strength is connective tissue — protect the elbow, ramp volume slowly.', gate: 'Full planche 3s.' },
      { name: '3. One-arm pull-up: archer → assisted → weighted negatives', cue: 'Build the elbow gradually; never rush the connective tissue.', gate: 'Controlled weighted OAP negative.' },
    ],
  },
  acro: {
    // Solo handstand mastery + base/flyer fundamentals come before any height.
    Foundation: [
      { name: '1. Solo handstand line + endurance', cue: 'Your handstand IS your base — own a long, straight, quiet one before partner work.', gate: '45s freestanding straight HS.' },
      { name: '2. Base fundamentals: bird/throne, counterbalances', cue: 'Stack flyer over base hips, locked arms, load straight through the bones; trust opposing tension.', gate: 'Stable 15s counterbalance / bird.' },
      { name: '3. Foot-to-hand setup (L-base)', cue: 'Flyer rises tall and hollow; base locks arms and drives straight up.', gate: 'Stable 10s foot-to-hand.' },
    ],
    // Static height + the low hand-to-hand entry.
    Developing: [
      { name: '1. Shoulder stand → 2-high', cue: 'Base braces overhead; flyer finds the line tall, quiet, patient.', gate: '10s stable 2-high.' },
      { name: '2. Whip-up / straight-leg-up to foot-to-hand', cue: 'Time the dip-drive together; flyer stays hollow and waits for the line.', gate: 'Consistent dynamic entry to f2h.' },
      { name: '3. Low hand-to-hand (L-base)', cue: 'Wrist-to-wrist, stacked bones, balance from the fingers — flyer hollow.', gate: '5s low H2H.' },
    ],
    // Static H2H, then add dynamics.
    Advanced: [
      { name: '1. Hand-to-hand (H2H) static', cue: 'Straight-arm base, flyer line stacked over the base shoulders — breathe and hold.', gate: '10s H2H hold.' },
      { name: '2. Pop-ups / partner press entries', cue: 'Drive through the legs, sync the count, soft controlled catches.', gate: 'Clean press entry to H2H.' },
      { name: '3. Dynamic washing-machines', cue: 'Continuous tension, smooth transitions, eyes up the whole rotation.', gate: 'One full washing-machine cycle controlled.' },
    ],
    // Standing-level and dynamic throws — years of base under it.
    Elite: [
      { name: '1. Standing hand-to-hand', cue: 'Earned off bulletproof HS + low H2H; tiny constant corrections, calm.', gate: 'Standing H2H 3–5s.' },
      { name: '2. Dynamic pitches & tempos (throws/catches)', cue: 'Commit fully, time the catch, control the landing arc.', gate: 'Consistent caught pitch.' },
      { name: '3. One-arm flag / advanced one-arm work', cue: 'Built on years of straight-arm and balance — patience over ego.', gate: 'Held one-arm shape with base.' },
    ],
  },
  parkour: {
    // Land safely FIRST, then precision/balance, then basic vaults.
    Foundation: [
      { name: '1. Landing mechanics + safety roll (both sides)', cue: 'Land quiet on the balls, absorb ankle→knee→hip; roll diagonally over the shoulder, never the spine.', gate: 'Silent drop landing + smooth roll both sides.' },
      { name: '2. Two-foot precision jumps (accuracy ladder)', cue: 'Arms set the balance, stick it dead on the rail/edge — no wobble, no step.', gate: '10/10 stuck rail precisions.' },
      { name: '3. Balance, QM & basic vaults (safety, step, lazy)', cue: 'Move efficiently — light hands, eyes ahead.', gate: 'Clean safety/step/lazy vaults at pace.' },
    ],
    // First dynamic vaults and wall work.
    Developing: [
      { name: '1. Kong/monkey vault — progressive distance', cue: 'Dive early, push long off the hands, tuck the knees through.', gate: 'Kong over a wide obstacle, controlled.' },
      { name: '2. Cat leap → climb-up', cue: 'Absorb on the wall, then pull and rotate over the top.', gate: 'Controlled cat-to-top, no scramble.' },
      { name: '3. Wall run (tac) height ladder', cue: 'Attack the wall, drive the knee, reach tall.', gate: 'Consistent tac to a high grab.' },
    ],
    // Combine: dynamic vault to a precise, often gapped, landing.
    Advanced: [
      { name: '1. Kong-precision: flat → gap', cue: 'Control the float, spot the landing, stick it quiet.', gate: 'Kong-pre over a gap, stuck silent.' },
      { name: '2. Running & stride precisions on rails', cue: 'Rhythm and confidence; commit fully to the stick.', gate: 'Stuck running precision to a rail.' },
      { name: '3. Underbars, dash-to-cat, larger gaps', cue: 'Carry speed through technique; scout before you send.', gate: 'Linked vault-to-cat at pace.' },
    ],
    // Flips on walls and big lines — ground-proven first.
    Elite: [
      { name: '1. Wall flips / wall spins (matted first)', cue: 'Earned off tricking flips + solid wall runs; commit, spot, land soft.', gate: 'Wall flip stuck off a wall.' },
      { name: '2. Gainers off walls / dynamic flips into lines', cue: 'Spot the takeoff, control rotation, land in balance to keep flowing.', gate: 'Flip linked into a moving line.' },
      { name: '3. Big high-consequence lines', cue: 'Only send when every single move is 100% on the ground first.', gate: 'Full line, every move pre-proven.' },
    ],
  },
  ninja: {
    // Grip + pulling base + the swing-release, before distance.
    Foundation: [
      { name: '1. Grip ladder: dead hang → towel → pinch/round-rung', cue: 'Grip is the gatekeeper — build hang time and finger tolerance; relax between, never death-grip.', gate: '60s dead hang · 30s towel hang.' },
      { name: '2. Active hang + scap pulls + strict pull-ups', cue: 'A strong pull underlies every obstacle.', gate: '10 strict pull-ups; controlled active hang.' },
      { name: '3. Short lache (swing-release) to catch', cue: 'Swing from the shoulders, release at the peak of the swing, catch soft.', gate: 'Clean short lache, caught and controlled.' },
    ],
    // Distance, the warped wall, and grip transitions.
    Developing: [
      { name: '1. Lache distance ladder (varied grips)', cue: 'Generate from the swing, release late, regrip soft and absorb.', gate: 'Consistent long lache between bars.' },
      { name: '2. Warped wall run-up', cue: 'Attack the wall, last steps high, reach long at the top.', gate: '14 ft warped wall.' },
      { name: '3. Grip transitions (cannonball, lap bar, rings)', cue: 'Smooth re-grips; conserve the forearms across holds.', gate: 'Linked 3-obstacle grip transition.' },
    ],
    // Fingertip strength and explosive grip.
    Advanced: [
      { name: '1. Cliffhanger / ledge traverse', cue: 'Fingertip strength + body tension; move from the back and hips, not just the arms.', gate: 'Traverse a cliffhanger ledge.' },
      { name: '2. Salmon ladder', cue: 'Explosive kip, drive both ends of the bar up together, control the catch.', gate: 'Salmon ladder rung-to-rung x3.' },
      { name: '3. Pegboard / dynamic grip moves', cue: 'Tight core, deliberate placements, save the forearms.', gate: 'Pegboard up-and-over.' },
    ],
    // Max fingertip + course pacing under fatigue.
    Elite: [
      { name: '1. Ultimate cliffhanger / floating boards', cue: 'Max fingertip strength + lache precision under fatigue.', gate: 'Dynamic fingertip move caught clean.' },
      { name: '2. Devil steps, floating doors, comp obstacles', cue: 'Train the full sequence, not just the single move.', gate: 'Linked competition obstacle cluster.' },
      { name: '3. Competition-pace circuits', cue: 'Grip endurance is the limiter — train it fresh AND deeply fatigued; pace it across the course.', gate: 'Full course pace without a grip blow-out.' },
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
