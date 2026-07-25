// ONA is no longer an active part of Jay's Life OS.
//
// Keep historical synced records intact, but prevent that retired workspace
// from resurfacing through an old folder, quest, mission, capture, brand, or
// copied daily schedule. These helpers are deliberately read-time filters:
// removing a former business should not silently destroy the user's archive.

const ONA_TEXT = /\bona\b|obstacle ninja academy/i;

const textMatches = (value) => typeof value === 'string' && ONA_TEXT.test(value);
const idMatches = (value) => {
  if (typeof value !== 'string') return false;
  const id = value.trim().toLowerCase();
  return id === 'ona' || id === 'scale-ona' || id.startsWith('ona-');
};

export const isRetiredOnaSurface = (surface) => idMatches(surface);

export const withoutRetiredOnaText = (value = '') =>
  String(value)
    .split('\n')
    .filter((line) => !textMatches(line))
    .join('\n')
    .trim();

export function isRetiredOnaFolder(folder) {
  return !!folder && (
    idMatches(String(folder.id ?? ''))
    || idMatches(folder.domain)
    || textMatches(folder.name)
  );
}

export function isRetiredOnaBrand(brand) {
  return !!brand && (idMatches(brand.id) || textMatches(brand.name));
}

export function isRetiredOnaQuest(quest) {
  return !!quest && (
    idMatches(quest.id)
    || idMatches(quest.domain)
    || textMatches(quest.title)
    || textMatches(quest.why)
  );
}

export function isRetiredOnaMission(mission) {
  return !!mission && (
    idMatches(mission.id)
    || idMatches(mission.domain)
    || idMatches(mission.go)
    || textMatches(mission.title)
    || textMatches(mission.why)
    || textMatches(mission.impact)
  );
}

export function isRetiredOnaTimelineItem(item) {
  return !!item && (
    idMatches(item.kind)
    || idMatches(item.domain)
    || textMatches(item.label)
    || textMatches(item.title)
  );
}

export const withoutRetiredOnaFolders = (folders = []) =>
  (Array.isArray(folders) ? folders : []).filter((folder) => !isRetiredOnaFolder(folder));

export const withoutRetiredOnaBrands = (brands = []) =>
  (Array.isArray(brands) ? brands : []).filter((brand) => !isRetiredOnaBrand(brand));

export const withoutRetiredOnaQuests = (quests = []) =>
  (Array.isArray(quests) ? quests : []).filter((quest) => !isRetiredOnaQuest(quest));

export const withoutRetiredOnaMissions = (missions = []) =>
  (Array.isArray(missions) ? missions : []).filter((mission) => !isRetiredOnaMission(mission));

export const withoutRetiredOnaTimeline = (items = []) =>
  (Array.isArray(items) ? items : []).filter((item) => !isRetiredOnaTimelineItem(item));

export function withoutRetiredOnaContent(content = {}) {
  const safe = content && typeof content === 'object' ? content : {};
  return {
    ...safe,
    brands: withoutRetiredOnaBrands(safe.brands),
    items: (Array.isArray(safe.items) ? safe.items : []).filter((item) => !idMatches(item?.brandId)),
  };
}

export function withoutRetiredOnaCaptures(captures = []) {
  return (Array.isArray(captures) ? captures : []).map((capture) => {
    const retiredTag = idMatches(capture?.tag);
    const retiredDomain = idMatches(capture?.domain);
    if (!retiredTag && !retiredDomain) return capture;

    // Preserve the note itself. A former ONA-routed note becomes archived;
    // an un-routed ONA-tagged idea returns to the neutral Idea bucket.
    const next = {
      ...capture,
      tag: retiredTag ? 'idea' : capture.tag,
      color: retiredTag ? '#45B7E8' : capture.color,
      status: retiredDomain ? 'archived' : capture.status,
    };
    if (retiredDomain) delete next.domain;
    return next;
  });
}

export function withoutRetiredOnaSnapshot(raw = {}) {
  return {
    ...raw,
    content: withoutRetiredOnaContent(raw.content),
    folders: withoutRetiredOnaFolders(raw.folders),
    captures: withoutRetiredOnaCaptures(raw.captures),
  };
}
