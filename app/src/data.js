

// ─────────────────────────────────────────────────────────
// LIFE OS — Seed data
// All hard-coded values pulled from the spec.
// ─────────────────────────────────────────────────────────

const BRANDS = [
  { id: 'jaymuvs',  name: 'JAYMUVS',     bgCls: 'brand-jaymuvs',    color: '#FF0033', status: 'On Track',   weeklyGoal: '7 posts',  pct: 71, posted: 5 },
  { id: 'motionmob',name: 'MOTION MOB',  bgCls: 'brand-motionmob',  color: '#0055FF', status: 'Hot',        weeklyGoal: '5 reels',  pct: 60, posted: 3 },
  { id: 'ona',      name: 'ONA ELITE',   bgCls: 'brand-ona-elite',  color: '#B6FF3C', status: 'Steady',     weeklyGoal: '6 posts',  pct: 83, posted: 5 },
  { id: 'jk',       name: 'JK ACRO',     bgCls: 'brand-jk-acro',    color: '#B14CFF', status: 'Cold',       weeklyGoal: '3 posts',  pct: 33, posted: 1 },
  { id: 'wooks',    name: 'ACRO WOOKS',  bgCls: 'brand-acro-wooks', color: '#FF8A3C', status: 'Building',   weeklyGoal: '4 posts',  pct: 50, posted: 2 },
  { id: 'ppp',      name: 'PPP',         bgCls: 'brand-ppp',        color: '#F5F5F7', status: 'Paused',     weeklyGoal: '2 posts',  pct: 50, posted: 1 },
];

const PIPELINE_STAGES = [
  { id: 'idea',     label: 'Idea',     count: 14, color: '#8A8A95' },
  { id: 'plan',     label: 'Plan',     count: 7,  color: '#00D4FF' },
  { id: 'shoot',    label: 'Shoot',    count: 4,  color: '#FFD23C' },
  { id: 'edit',     label: 'Edit',     count: 3,  color: '#FF8A3C' },
  { id: 'schedule', label: 'Schedule', count: 5,  color: '#B14CFF' },
  { id: 'posted',   label: 'Posted',   count: 23, color: '#B6FF3C' },
];

const HOOKS = [
  'I trained 6 disciplines for 10 years — here\'s what actually transferred.',
  'You don\'t need flexibility for this. You need patience.',
  'The reason your B-twist won\'t land (it\'s not your legs).',
  'I tested every parkour shoe in 2026. Only one survived.',
  'Stop training like a gymnast if you want to look like an athlete.',
  'Most people quit on day 17. Here\'s what day 18 looks like.',
];

const DISCIPLINES = [
  { id: 'gymnastics',   name: 'Gymnastics',   color: '#FFD23C', icon: '◐' },
  { id: 'tricking',     name: 'Tricking',     color: '#FF0033', icon: '↻' },
  { id: 'calisthenics', name: 'Calisthenics', color: '#B6FF3C', icon: '⊞' },
  { id: 'acro',         name: 'Acro',         color: '#B14CFF', icon: '∞' },
  { id: 'parkour',      name: 'Parkour',      color: '#00D4FF', icon: '▲' },
  { id: 'ninja',        name: 'Ninja',        color: '#FF8A3C', icon: '◆' },
];

// ─────────────────────────────────────────────────────────
// Skill trees — research-grounded progressions, each with a
// tier (Foundation → Developing → Advanced → Elite), a learning
// cue, and editable status/% you track over time.
// ─────────────────────────────────────────────────────────
const SKILLS = {
  gymnastics: [
    { name: 'Handstand',            tier: 'Foundation', cue: 'Stack shoulders over wrists, hollow body, push tall', status: 'done', pct: 100 },
    { name: 'Bridge / backbend',    tier: 'Foundation', cue: 'Open shoulders & hip flexors; press to straight arms', status: 'done', pct: 100 },
    { name: 'Cartwheel',            tier: 'Foundation', cue: 'Hand-hand-foot-foot, hips over shoulders, stay in plane', status: 'done', pct: 100 },
    { name: 'Round-off',            tier: 'Foundation', cue: 'Fast hurdle, snap legs together, block & rebound', status: 'done', pct: 100 },
    { name: 'Back handspring',      tier: 'Developing', cue: 'Sit & jump back, reach over, snap-down to feet', status: 'done', pct: 100 },
    { name: 'Front handspring',     tier: 'Developing', cue: 'Block off the floor, hollow-to-arch, land tall', status: 'active', pct: 70 },
    { name: 'Standing back tuck',   tier: 'Developing', cue: 'Jump UP first, set arms, then pull the knees', status: 'done', pct: 100 },
    { name: 'RO–BHS–back tuck',     tier: 'Advanced',   cue: 'Ride the rebound, set tall, tuck late', status: 'active', pct: 80 },
    { name: 'Back layout',          tier: 'Advanced',   cue: 'Stay straight & hollow — no early arch (twist prereq)', status: 'active', pct: 60 },
    { name: 'Punch front layout',   tier: 'Advanced',   cue: 'Block, lift the hips, spot the floor', status: 'locked', pct: 0 },
    { name: 'Layout full twist',    tier: 'Elite',      cue: 'Set straight first, initiate twist late from arms/hip', status: 'active', pct: 68 },
    { name: 'Double full',          tier: 'Elite',      cue: 'Bigger set, faster twist, hold the line', status: 'locked', pct: 0 },
    { name: 'Double back (tuck)',   tier: 'Elite',      cue: 'Huge set, early tight tuck, spot the second flip', status: 'locked', pct: 0 },
  ],
  tricking: [
    { name: 'Tornado kick',         tier: 'Foundation', cue: 'The first trick: 360 spin into a round kick', status: 'done', pct: 100 },
    { name: 'Pop 360',              tier: 'Foundation', cue: 'Vertical 360 jump — sets the spin for everything', status: 'done', pct: 100 },
    { name: 'Aerial (no-hand CW)',  tier: 'Developing', cue: 'Sideways flip; reach far, kick the legs over', status: 'done', pct: 100 },
    { name: 'Raiz',                 tier: 'Developing', cue: 'Capoeira base — parent of touchdown raiz, sideswipe', status: 'active', pct: 70 },
    { name: 'Butterfly kick',       tier: 'Developing', cue: 'Horizontal flip, lead leg whips, stay flat', status: 'done', pct: 100 },
    { name: 'Butterfly twist',      tier: 'Advanced',   cue: 'Bkick + 360: set flat, THEN twist', status: 'active', pct: 82 },
    { name: 'Gainer',               tier: 'Advanced',   cue: 'Backflip off one leg moving forward (cork prereq)', status: 'active', pct: 55 },
    { name: 'Cheat 720',            tier: 'Advanced',   cue: 'Tornado set into a double-rotation kick', status: 'locked', pct: 0 },
    { name: 'Cork',                 tier: 'Elite',      cue: 'Off-axis backflip + full twist; dive head, set low', status: 'locked', pct: 0 },
    { name: 'Raiz family combos',   tier: 'Elite',      cue: 'Touchdown raiz → sideswipe → gumbi flow', status: 'locked', pct: 0 },
    { name: 'Double cork',          tier: 'Elite',      cue: 'Two off-axis rotations — huge set, stack the twist', status: 'locked', pct: 0 },
  ],
  calisthenics: [
    { name: 'Hollow & arch holds',  tier: 'Foundation', cue: 'The core line behind every skill — own it first', status: 'done', pct: 100 },
    { name: 'Pull-up / Dip base',   tier: 'Foundation', cue: 'Build capacity: 3×8–12 clean, full-range reps', status: 'done', pct: 100 },
    { name: 'Freestanding handstand', tier: 'Foundation', cue: 'Wall → balance; stack & breathe, shoulder flexion', status: 'done', pct: 100 },
    { name: 'L-sit',                tier: 'Developing', cue: 'Compress, depress the shoulders, point the toes', status: 'done', pct: 100 },
    { name: 'Tuck → straddle front lever', tier: 'Developing', cue: 'Straight arms, pull the bar to your hips, lats on', status: 'active', pct: 72 },
    { name: 'Back lever',           tier: 'Developing', cue: 'Tuck → full; needs shoulder-extension mobility', status: 'active', pct: 60 },
    { name: 'Strict muscle-up',     tier: 'Developing', cue: 'False grip, explosive pull, fast transition over', status: 'done', pct: 100 },
    { name: 'Full front lever',     tier: 'Advanced',   cue: 'Horizontal, straight, scapula retracted', status: 'active', pct: 50 },
    { name: 'Handstand push-up',    tier: 'Advanced',   cue: 'Stack, control the descent, press to lockout', status: 'locked', pct: 0 },
    { name: 'Tuck → straddle planche', tier: 'Advanced', cue: 'Lean forward, protract, straight arms, wrist mobility', status: 'locked', pct: 0 },
    { name: 'Human flag',           tier: 'Advanced',   cue: 'Top arm pulls, bottom pushes, full-body tension', status: 'locked', pct: 0 },
    { name: 'Full planche',         tier: 'Elite',      cue: 'Target a clean 5-second hold', status: 'locked', pct: 0 },
    { name: 'One-arm pull-up',      tier: 'Elite',      cue: 'Peak relative strength — grease the groove', status: 'locked', pct: 0 },
  ],
  acro: [
    { name: 'Counterbalances',      tier: 'Foundation', cue: 'Shared tension; base straight legs, flyer hollow', status: 'done', pct: 100 },
    { name: 'Foot-to-hand (throne)', tier: 'Foundation', cue: 'Base stacks bones, flyer finds a tall line', status: 'done', pct: 100 },
    { name: 'L-base hand-to-hand',  tier: 'Developing', cue: 'Base presses bones, flyer holds a straight handstand', status: 'done', pct: 100 },
    { name: 'Washing machines',     tier: 'Developing', cue: 'Link transitions into a smooth repeating loop', status: 'active', pct: 65 },
    { name: 'Pops (F2H → H2H)',     tier: 'Developing', cue: 'Time the dip-drive; flyer stays tight & patient', status: 'active', pct: 55 },
    { name: 'Standing hand-to-hand', tier: 'Advanced',  cue: 'Standing base — huge balance, trust & alignment', status: 'active', pct: 40 },
    { name: 'Icarian throws',       tier: 'Advanced',   cue: 'Base legs throw, flyer flips and re-lands clean', status: 'done', pct: 100 },
    { name: 'Standing whips/pitches', tier: 'Advanced', cue: 'Dynamic throw to handstand — commit & spot', status: 'active', pct: 55 },
    { name: 'Dynamic throws (cuddles)', tier: 'Elite',  cue: 'Flyer rotates, base catches — timing is everything', status: 'locked', pct: 0 },
    { name: 'Standing H2H press',   tier: 'Elite',      cue: 'Press to handstand standing — elite balance + strength', status: 'locked', pct: 0 },
    { name: '2-high & pitch combos', tier: 'Elite',     cue: 'Performance-level stacks and sequences', status: 'locked', pct: 0 },
  ],
  parkour: [
    { name: 'Landing & roll',       tier: 'Foundation', cue: 'Absorb soft, roll diagonally shoulder-to-hip', status: 'done', pct: 100 },
    { name: 'Balance (rail)',       tier: 'Foundation', cue: 'Eyes ahead, arms wide, slow & deliberate', status: 'done', pct: 100 },
    { name: 'Precision jump',       tier: 'Foundation', cue: 'Stick it quiet & still — no extra steps', status: 'done', pct: 100 },
    { name: 'Safety & lazy vault',  tier: 'Foundation', cue: 'One hand/one foot; let the hips lead', status: 'done', pct: 100 },
    { name: 'Speed vault',          tier: 'Developing', cue: 'Hand guides, run straight through the obstacle', status: 'done', pct: 100 },
    { name: 'Kong / dash vault',    tier: 'Developing', cue: 'Dive hands, tuck knees through (kong)', status: 'done', pct: 100 },
    { name: 'Cat leap (arm jump)',  tier: 'Developing', cue: 'Hands on top, feet on wall, absorb & stick', status: 'done', pct: 100 },
    { name: 'Wall run',             tier: 'Advanced',   cue: 'Plant high, drive up, grab the top edge', status: 'active', pct: 60 },
    { name: 'Cat to climb-up',      tier: 'Advanced',   cue: 'Explode the hips, press out fast', status: 'active', pct: 50 },
    { name: 'Running precision',    tier: 'Advanced',   cue: 'Carry speed into single-foot precise landings', status: 'active', pct: 55 },
    { name: 'Underbar',             tier: 'Advanced',   cue: 'Swing through, redirect momentum forward', status: 'locked', pct: 0 },
    { name: 'Wall flip / palm flip', tier: 'Elite',     cue: 'Advanced flow — control before commitment', status: 'locked', pct: 0 },
    { name: 'Running gap jumps',    tier: 'Elite',      cue: 'Commit fully, sight the landing early', status: 'locked', pct: 0 },
  ],
  ninja: [
    { name: 'Grip base (dead hangs)', tier: 'Foundation', cue: 'The #1 ninja skill — train hangs, pinch & towel grip', status: 'done', pct: 100 },
    { name: 'Pull-up strength',     tier: 'Foundation', cue: 'Foundation for every overhead obstacle', status: 'done', pct: 100 },
    { name: 'Balance / quad steps', tier: 'Foundation', cue: 'Explosive, light, quick footwork', status: 'done', pct: 100 },
    { name: 'Lache (bar-to-bar)',   tier: 'Developing', cue: 'Build swing, release at the peak, catch tight', status: 'active', pct: 70 },
    { name: 'Plyometric pull-ups',  tier: 'Developing', cue: 'Explosive pull, float, re-grip (salmon-ladder base)', status: 'done', pct: 100 },
    { name: 'Cargo net / rope',     tier: 'Developing', cue: 'Leg-lock & efficient, economical pulls', status: 'done', pct: 100 },
    { name: 'Salmon ladder',        tier: 'Advanced',   cue: 'Explosive plyo pull, pop the bar up rung by rung', status: 'done', pct: 100 },
    { name: 'Dynamic lache to catch', tier: 'Advanced', cue: 'Longer gaps; absorb and lock the catch', status: 'active', pct: 50 },
    { name: 'Devil steps / pegboard', tier: 'Advanced', cue: 'Grip + control transferring on small holds', status: 'active', pct: 40 },
    { name: 'Cliffhanger',          tier: 'Elite',      cue: 'Brutal fingertip grip; stay close to the wall', status: 'active', pct: 45 },
    { name: 'Warped wall (14ft)',   tier: 'Elite',      cue: 'Sprint, one big push, reach high — start small', status: 'active', pct: 60 },
    { name: 'Floating obstacles',   tier: 'Elite',      cue: 'Elite grip + body control & momentum management', status: 'locked', pct: 0 },
  ],
};

// Body radar — current vs goal (Strength, Power, Skill, Mobility, Endurance, Recovery)
const RADAR_AXES = ['Strength', 'Power', 'Skill', 'Mobility', 'Endurance', 'Recovery'];
const RADAR_CURRENT = [82, 78, 88, 65, 72, 58]; // 0–100
const RADAR_GOAL    = [90, 90, 95, 85, 85, 80];

// Today's timeline
const TIMELINE = [
  { time: '06:30', label: 'Mobility flow + cold plunge',  color: '#00D4FF', kind: 'Body' },
  { time: '08:00', label: 'Deep work — JayMuvs B-twist edit', color: '#FF0033', kind: 'Create' },
  { time: '10:30', label: 'Ninja session @ ONA',           color: '#FF8A3C', kind: 'Train' },
  { time: '13:00', label: 'Coach review w/ Riley',         color: '#B6FF3C', kind: 'ONA' },
  { time: '16:00', label: 'Content shoot — B-twist tutorial', color: '#FF3CC8', kind: 'Create' },
  { time: '19:00', label: 'Acro practice w/ Chelsea',      color: '#B14CFF', kind: 'Acro' },
];

// 14-day momentum heatmap (0..4 intensity). Today = last cell.
const MOMENTUM = [3, 4, 2, 4, 3, 0, 4, 4, 3, 4, 4, 2, 4, 4];

// ONA HQ
const ONA_STATS = { members: 248, mrr: 38450, nps: 72 };

const SALES_STAGES = [
  { id: 'leads',    label: 'Leads',       count: 27, color: '#00D4FF', stale: 5 },
  { id: 'trials',   label: 'Trials',      count: 11, color: '#FFD23C', stale: 0 },
  { id: 'closing',  label: 'Closing',     count: 6,  color: '#FF8A3C', stale: 2 },
  { id: 'new',      label: 'New Members', count: 9,  color: '#B6FF3C', stale: 0 },
];

const COACHES = [
  { id: 'riley',  name: 'Riley',     plPrice: 110, grade: 'A',  role: 'Head Coach',  active: true,  initial: 'R', color: '#FF0033' },
  { id: 'luke',   name: 'Luke',      plPrice: 95,  grade: 'A',  role: 'Ninja Lead',  active: true,  initial: 'L', color: '#FF8A3C' },
  { id: 'jay-l',  name: 'Jay Lache', plPrice: 90,  grade: 'A-', role: 'Tricking',    active: true,  initial: 'J', color: '#00D4FF' },
  { id: 'avery',  name: 'Avery',     plPrice: 80,  grade: 'B+', role: 'Gymnastics',  active: true,  initial: 'A', color: '#B14CFF' },
  { id: 'eric',   name: 'Eric',      plPrice: 75,  grade: 'B',  role: 'Strength',    active: true,  initial: 'E', color: '#B6FF3C' },
];

const BENCH = [
  { id: 'myra',   name: 'Myra',   initial: 'M', color: '#FF3CC8' },
  { id: 'ava',    name: 'Ava',    initial: 'A', color: '#FFD23C' },
  { id: 'jordan', name: 'Jordan', initial: 'J', color: '#00D4FF' },
  { id: 'billy',  name: 'Billy',  initial: 'B', color: '#FF8A3C' },
];

const INITIATIVES = [
  { id: 1, title: 'Launch Adult Ninja League — 8 wk pilot',   priority: 'P0', pct: 68, due: 'Jun 14' },
  { id: 2, title: 'Refit obstacle wall — Lane 3',             priority: 'P0', pct: 40, due: 'Jun 02' },
  { id: 3, title: 'Migrate billing to Stripe Connect',        priority: 'P1', pct: 85, due: 'Jun 09' },
  { id: 4, title: 'Re-shoot coach intro videos',              priority: 'P1', pct: 22, due: 'Jun 28' },
  { id: 5, title: 'Audit member retention curve',             priority: 'P2', pct: 10, due: 'Jul 12' },
];

const TODAY = {
  date: 'Wed · May 27',
  greeting: 'Good morning, Jay',
  readiness: 84,
  energy: 8,
  focus: 7,
  body: 9,
  mood: 8,
  oneThing: 'Film the B-twist tutorial — full breakdown for JayMuvs',
  streak: 12,
};

export {
  BRANDS, PIPELINE_STAGES, HOOKS, DISCIPLINES, SKILLS,
  RADAR_AXES, RADAR_CURRENT, RADAR_GOAL, TIMELINE, MOMENTUM,
  ONA_STATS, SALES_STAGES, COACHES, BENCH, INITIATIVES, TODAY,
};
