// Lucide-style inline icons. Stroke-based, 24x24 viewBox.
// All accept { size, color, strokeWidth } and forward style.

const Ico = ({ size = 20, color = 'currentColor', stroke = 1.6, style, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
  >
    {children}
  </svg>
);

const IconHome = (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" /></Ico>;
const IconBolt = (p) => <Ico {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></Ico>;
const IconPlay = (p) => <Ico {...p}><path d="M6 4l14 8-14 8V4z" /></Ico>;
const IconNinja = (p) => <Ico {...p}><path d="M3 11h18" /><path d="M5 11c0-5 3-8 7-8s7 3 7 8" /><path d="M7 11v3a5 5 0 0010 0v-3" /><circle cx="9" cy="13" r="0.7" fill="currentColor" /><circle cx="15" cy="13" r="0.7" fill="currentColor" /></Ico>;
const IconSparkles = (p) => <Ico {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" /></Ico>;
const IconPlus = (p) => <Ico {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Ico>;
const IconCheck = (p) => <Ico {...p}><polyline points="4 12 10 18 20 6" /></Ico>;
const IconMic = (p) => <Ico {...p}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0014 0" /><line x1="12" y1="18" x2="12" y2="22" /></Ico>;
const IconChevronRight = (p) => <Ico {...p}><polyline points="9 6 15 12 9 18" /></Ico>;
const IconChevronDown = (p) => <Ico {...p}><polyline points="6 9 12 15 18 9" /></Ico>;
const IconClose = (p) => <Ico {...p}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></Ico>;
const IconLock = (p) => <Ico {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></Ico>;
const IconCircle = (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /></Ico>;
const IconFlame = (p) => <Ico {...p}><path d="M12 2c0 5-5 6-5 11a5 5 0 0010 0c0-2.5-2-3.5-3-5 2-1 4-3 4-6-3 0-6 0-6 0z" /></Ico>;
const IconCamera = (p) => <Ico {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="12" cy="13" r="4" /><path d="M8 7l1.5-3h5L16 7" /></Ico>;
const IconCopy = (p) => <Ico {...p}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" /></Ico>;
const IconUsers = (p) => <Ico {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.5 3-6 6-6s6 2.5 6 6" /><circle cx="17" cy="9" r="2.5" /><path d="M15 20c0-2.5 1.5-4.5 4-4.5" /></Ico>;
const IconTrendUp = (p) => <Ico {...p}><polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" /></Ico>;
const IconTarget = (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></Ico>;
const IconWarn = (p) => <Ico {...p}><path d="M12 3l10 18H2L12 3z" /><line x1="12" y1="10" x2="12" y2="14" /><circle cx="12" cy="17.5" r="0.6" fill="currentColor" /></Ico>;
const IconCalendar = (p) => <Ico {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></Ico>;
const IconClock = (p) => <Ico {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></Ico>;
const IconArrowRight = (p) => <Ico {...p}><line x1="4" y1="12" x2="20" y2="12" /><polyline points="14 6 20 12 14 18" /></Ico>;
const IconSend = (p) => <Ico {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Ico>;
const IconActivity = (p) => <Ico {...p}><polyline points="3 12 7 12 10 4 14 20 17 12 21 12" /></Ico>;

Object.assign(window, {
  Ico,
  IconHome, IconBolt, IconPlay, IconNinja, IconSparkles, IconPlus, IconCheck,
  IconMic, IconChevronRight, IconChevronDown, IconClose, IconLock, IconCircle,
  IconFlame, IconCamera, IconCopy, IconUsers, IconTrendUp, IconTarget, IconWarn,
  IconCalendar, IconClock, IconArrowRight, IconSend, IconActivity,
});
