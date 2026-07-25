const asList = (value) => (Array.isArray(value) ? value : []);

const clean = (value, max = 180) => String(value ?? '').trim().slice(0, max);

export function findWorkspaceFolder(folders = [], domain, aliases = []) {
  const list = asList(folders);
  const byDomain = list.find((folder) => folder?.domain === domain);
  if (byDomain) return byDomain;

  const names = new Set(
    asList(aliases)
      .map((name) => clean(name, 100).toLowerCase())
      .filter(Boolean)
  );
  return list.find((folder) => names.has(clean(folder?.name, 100).toLowerCase()));
}

export function updateWorkspaceFolder(folders = [], meta, updater) {
  const list = asList(folders);
  const aliases = meta?.aliases || [];
  const current = findWorkspaceFolder(list, meta?.domain, aliases);
  const base = current || {
    id: `world-${meta?.domain || 'workspace'}`,
    domain: meta?.domain || 'workspace',
    name: clean(meta?.name, 80) || 'Workspace',
    color: meta?.color || '#45B7E8',
    emoji: meta?.emoji || '✦',
    pinned: false,
    notes: [],
    projects: [],
  };
  const normalized = {
    ...base,
    notes: asList(base.notes),
    projects: asList(base.projects),
  };
  const next = typeof updater === 'function' ? updater(normalized) : normalized;

  if (!current) return [...list, next];
  return list.map((folder) => (folder === current ? next : folder));
}

export function createWorkspaceIdea(text, id = Date.now()) {
  return {
    id: `idea-${id}`,
    title: clean(text),
    body: '',
    createdAt: Number(id) || Date.now(),
  };
}

export function createWorkspaceProject(title, id = Date.now()) {
  return {
    id: `project-${id}`,
    title: clean(title),
    status: 'active',
    notes: '',
    due: '',
    steps: [],
    createdAt: Number(id) || Date.now(),
  };
}

export const PROJECT_STATUS_ORDER = ['idea', 'active', 'waiting', 'done'];

export function nextProjectStatus(status = 'active') {
  const index = PROJECT_STATUS_ORDER.indexOf(status);
  return PROJECT_STATUS_ORDER[(index + 1 + PROJECT_STATUS_ORDER.length) % PROJECT_STATUS_ORDER.length];
}

export function workspaceProjectProgress(project = {}) {
  const steps = asList(project.steps);
  if (project.status === 'done') return 100;
  if (!steps.length) return 0;
  return Math.round((steps.filter((step) => step?.done).length / steps.length) * 100);
}

export function nextWorkspaceStep(project = {}) {
  return asList(project.steps).find((step) => !step?.done) || null;
}
