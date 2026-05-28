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

const SKILLS = {
  gymnastics:   [
    { name: 'Round-off',    status: 'done',   pct: 100 },
    { name: 'Layout',       status: 'done',   pct: 100 },
    { name: 'Full Twist',   status: 'active', pct: 68 },
    { name: 'Double Full',  status: 'locked', pct: 0 },
  ],
  tricking: [
    { name: 'Aerial',       status: 'done',   pct: 100 },
    { name: 'B-twist',      status: 'active', pct: 82 },
    { name: 'Cheat 720',    status: 'locked', pct: 0 },
    { name: 'Jackknife',    status: 'locked', pct: 0 },
  ],
  calisthenics: [
    { name: 'Muscle-up',    status: 'done',   pct: 100 },
    { name: 'Front Lever',  status: 'active', pct: 72 },
    { name: 'Planche',      status: 'locked', pct: 0 },
  ],
  acro: [
    { name: 'H2H',                status: 'done',   pct: 100 },
    { name: 'Icarian',            status: 'done',   pct: 100 },
    { name: 'Dynamic throws',     status: 'active', pct: 55 },
  ],
  parkour: [
    { name: 'Precision',    status: 'done',   pct: 100 },
    { name: 'Kong',         status: 'done',   pct: 100 },
    { name: 'Wallrun',      status: 'active', pct: 60 },
    { name: 'Palm flip',    status: 'locked', pct: 0 },
  ],
  ninja: [
    { name: 'Salmon ladder',    status: 'done',   pct: 100 },
    { name: 'Cliffhanger',      status: 'active', pct: 45 },
    { name: 'Warped wall',      status: 'locked', pct: 0 },
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

Object.assign(window, {
  BRANDS, PIPELINE_STAGES, HOOKS, DISCIPLINES, SKILLS,
  RADAR_AXES, RADAR_CURRENT, RADAR_GOAL, TIMELINE, MOMENTUM,
  ONA_STATS, SALES_STAGES, COACHES, BENCH, INITIATIVES, TODAY,
});
