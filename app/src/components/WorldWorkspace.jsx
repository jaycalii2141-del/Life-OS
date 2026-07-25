import { useState } from 'react';
import {
  IconBook,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconPlus,
  IconSparkles,
  IconTarget,
  IconTrash,
} from './icons.jsx';
import { HUDTicks } from './atoms.jsx';
import { DOMAIN_ALIASES, SEED_FOLDERS } from '../data.js';
import { useSyncedState } from '../useSyncedState.js';
import { celebrate } from '../lib/haptics.js';
import { logEvent } from '../lib/telemetry.js';
import { withoutRetiredOnaFolders } from '../lib/retiredOna.js';
import {
  createWorkspaceIdea,
  createWorkspaceProject,
  findWorkspaceFolder,
  nextProjectStatus,
  nextWorkspaceStep,
  updateWorkspaceFolder,
  workspaceProjectProgress,
} from '../lib/worldWorkspace.js';

export const WORLD_NOTEBOOKS = [
  { domain: 'podium', label: 'Podium', name: 'Podium', color: '#E9C46A', emoji: '🏆' },
  { domain: 'movement', label: 'Move', name: 'Movement', color: '#42E0B1', emoji: '🤸' },
  { domain: 'social', label: 'Creator', name: 'Creator', color: '#FFB250', emoji: '🎬' },
  { domain: 'wife', label: 'Belong', name: 'Wife & I', color: '#FF74A9', emoji: '❤️' },
  { domain: 'adventure', label: 'Explore', name: 'Explore', color: '#7D8CFF', emoji: '🌎' },
  { domain: 'self', label: 'Self', name: 'Self', color: '#45B7E8', emoji: '🧭' },
];

const STATUS = {
  idea: { label: 'Idea', color: '#7D8CFF' },
  active: { label: 'Active', color: '#42E0B1' },
  waiting: { label: 'Waiting', color: '#E9C46A' },
  done: { label: 'Done', color: '#34D399' },
};

function entryDate(entry) {
  const value = Number(entry?.createdAt || (typeof entry?.id === 'number' ? entry.id : 0));
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function IdeaCard({ note, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`world-workspace__entry${open ? ' is-open' : ''}`}>
      <button type="button" className="world-workspace__entry-top" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="world-workspace__entry-icon"><IconSparkles size={14} /></span>
        <span className="world-workspace__entry-copy">
          <strong>{note.title || 'Untitled idea'}</strong>
          {!open && note.body && <small>{note.body}</small>}
        </span>
        {entryDate(note) && <span className="world-workspace__date">{entryDate(note)}</span>}
        <IconChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }} />
      </button>

      {open && (
        <div className="world-workspace__editor">
          <label>
            <span>Idea</span>
            <input
              value={note.title || ''}
              onChange={(event) => onUpdate({ title: event.target.value })}
              placeholder="Name the idea"
            />
          </label>
          <label>
            <span>Notes</span>
            <textarea
              value={note.body || ''}
              onChange={(event) => onUpdate({ body: event.target.value })}
              placeholder="What makes it exciting? What would make it real?"
              rows={4}
            />
          </label>
          <button type="button" className="world-workspace__delete" onClick={onDelete}>
            <IconTrash size={13} /> Delete idea
          </button>
        </div>
      )}
    </article>
  );
}

function ProjectCard({ project, color, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [stepDraft, setStepDraft] = useState('');
  const steps = Array.isArray(project.steps) ? project.steps : [];
  const status = STATUS[project.status] || STATUS.active;
  const progress = workspaceProjectProgress(project);
  const next = nextWorkspaceStep(project);

  const addStep = () => {
    const text = stepDraft.trim();
    if (!text) return;
    onUpdate({ steps: [...steps, { id: `step-${Date.now()}`, text, done: false }] });
    setStepDraft('');
    celebrate();
  };

  const cycleStatus = () => {
    const nextStatus = nextProjectStatus(project.status);
    onUpdate({
      status: nextStatus,
      completedAt: nextStatus === 'done' ? Date.now() : undefined,
    });
    if (nextStatus === 'done') celebrate();
  };

  return (
    <article className={`world-workspace__entry world-workspace__project${open ? ' is-open' : ''}`}>
      <div className="world-workspace__entry-top">
        <button type="button" className="world-workspace__project-main" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          <span className="world-workspace__entry-icon"><IconTarget size={14} /></span>
          <span className="world-workspace__entry-copy">
            <strong>{project.title || 'Untitled project'}</strong>
            <small>{next ? `Next · ${next.text}` : (progress === 100 ? 'Complete' : 'Add the first next move')}</small>
          </span>
        </button>
        <button
          type="button"
          className="world-workspace__status"
          style={{ '--status-color': status.color }}
          onClick={cycleStatus}
          aria-label={`Project status ${status.label}. Tap to change.`}
        >
          {status.label}
        </button>
        <button type="button" className="world-workspace__chevron" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Collapse project' : 'Expand project'}>
          <IconChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease' }} />
        </button>
      </div>

      <div className="world-workspace__progress" aria-label={`${progress}% complete`}>
        <span style={{ width: `${progress}%`, background: color }} />
      </div>

      {open && (
        <div className="world-workspace__editor">
          <label>
            <span>Project</span>
            <input value={project.title || ''} onChange={(event) => onUpdate({ title: event.target.value })} placeholder="Project name" />
          </label>
          <label>
            <span>Context</span>
            <textarea
              value={project.notes || ''}
              onChange={(event) => onUpdate({ notes: event.target.value })}
              placeholder="What are you building, and why does it matter?"
              rows={3}
            />
          </label>

          <div className="world-workspace__field-label">Next moves</div>
          <div className="world-workspace__steps">
            {steps.map((step) => (
              <div key={step.id} className="world-workspace__step">
                <button
                  type="button"
                  className={`world-workspace__step-check${step.done ? ' is-done' : ''}`}
                  onClick={() => onUpdate({ steps: steps.map((item) => (item.id === step.id ? { ...item, done: !item.done } : item)) })}
                  aria-label={step.done ? `Mark ${step.text} incomplete` : `Complete ${step.text}`}
                >
                  {step.done && <IconCheck size={12} stroke={2.7} />}
                </button>
                <input
                  value={step.text || ''}
                  className={step.done ? 'is-done' : ''}
                  onChange={(event) => onUpdate({ steps: steps.map((item) => (item.id === step.id ? { ...item, text: event.target.value } : item)) })}
                  aria-label="Project step"
                />
                <button
                  type="button"
                  className="world-workspace__step-delete"
                  onClick={() => onUpdate({ steps: steps.filter((item) => item.id !== step.id) })}
                  aria-label={`Delete ${step.text}`}
                >
                  <IconTrash size={12} />
                </button>
              </div>
            ))}
            <div className="world-workspace__step-add">
              <input
                value={stepDraft}
                onChange={(event) => setStepDraft(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && addStep()}
                placeholder="Add the next concrete move…"
                aria-label="New project step"
              />
              <button type="button" onClick={addStep} aria-label="Add project step"><IconPlus size={15} /></button>
            </div>
          </div>

          <label>
            <span><IconCalendar size={12} /> Due date</span>
            <input type="date" value={project.due || ''} onChange={(event) => onUpdate({ due: event.target.value })} />
          </label>

          <button type="button" className="world-workspace__delete" onClick={onDelete}>
            <IconTrash size={13} /> Delete project
          </button>
        </div>
      )}
    </article>
  );
}

export function WorldWorkspace({
  domain,
  name,
  color = '#45B7E8',
  emoji = '✦',
  heading = 'Ideas & projects',
  description = 'Catch the thought now. Give it a next move when it becomes real.',
}) {
  const aliases = DOMAIN_ALIASES[domain] || [name];
  const [storedFolders, setFolders] = useSyncedState('lifeos:folders', SEED_FOLDERS);
  const folders = withoutRetiredOnaFolders(storedFolders);
  const folder = findWorkspaceFolder(folders, domain, aliases);
  const notes = Array.isArray(folder?.notes) ? folder.notes : [];
  const projects = Array.isArray(folder?.projects) ? folder.projects : [];
  const activeProjects = projects.filter((project) => project.status !== 'done').length;
  const [mode, setMode] = useState('ideas');
  const [draft, setDraft] = useState('');

  const meta = { domain, name, color, emoji, aliases };
  const mutate = (updater) => setFolders((current) => (
    updateWorkspaceFolder(withoutRetiredOnaFolders(current), meta, updater)
  ));

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const id = Date.now();
    mutate((current) => mode === 'ideas'
      ? { ...current, notes: [createWorkspaceIdea(text, id), ...current.notes] }
      : { ...current, projects: [createWorkspaceProject(text, id), ...current.projects] });
    setDraft('');
    celebrate();
    logEvent('world-workspace', `add-${mode}`, domain);
  };

  const updateNote = (id, patch) => mutate((current) => ({
    ...current,
    notes: current.notes.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: Date.now() } : note)),
  }));
  const deleteNote = (id) => {
    if (!window.confirm('Delete this idea?')) return;
    mutate((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }));
  };
  const updateProject = (id, patch) => mutate((current) => ({
    ...current,
    projects: current.projects.map((project) => (project.id === id ? { ...project, ...patch, updatedAt: Date.now() } : project)),
  }));
  const deleteProject = (id) => {
    if (!window.confirm('Delete this project and its next moves?')) return;
    mutate((current) => ({ ...current, projects: current.projects.filter((project) => project.id !== id) }));
  };

  return (
    <section className="world-workspace hud" style={{ '--workspace-color': color }}>
      <HUDTicks />
      <header className="world-workspace__header">
        <div className="world-workspace__mark" aria-hidden="true">{emoji}</div>
        <div>
          <div className="world-workspace__kicker">{name} workspace</div>
          <h3>{heading}</h3>
          <p>{description}</p>
        </div>
        <div className="world-workspace__counts" aria-label={`${notes.length} ideas and ${activeProjects} active projects`}>
          <strong>{notes.length + activeProjects}</strong>
          <span>alive</span>
        </div>
      </header>

      <div className="world-workspace__tabs" role="tablist" aria-label={`${name} workspace view`}>
        <button type="button" role="tab" aria-selected={mode === 'ideas'} className={mode === 'ideas' ? 'is-active' : ''} onClick={() => setMode('ideas')}>
          <IconBook size={14} /> Ideas <span>{notes.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={mode === 'projects'} className={mode === 'projects' ? 'is-active' : ''} onClick={() => setMode('projects')}>
          <IconTarget size={14} /> Projects <span>{activeProjects}</span>
        </button>
      </div>

      <div className="world-workspace__capture">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && add()}
          placeholder={mode === 'ideas' ? `Capture a ${name} idea…` : `What are you working on in ${name}?`}
          aria-label={mode === 'ideas' ? `New ${name} idea` : `New ${name} project`}
        />
        <button type="button" onClick={add} disabled={!draft.trim()} aria-label={mode === 'ideas' ? 'Save idea' : 'Create project'}>
          <IconPlus size={18} stroke={2.5} />
        </button>
      </div>

      <div className="world-workspace__list">
        {mode === 'ideas' && (
          notes.length
            ? notes.map((note) => (
              <IdeaCard
                key={note.id}
                note={note}
                onUpdate={(patch) => updateNote(note.id, patch)}
                onDelete={() => deleteNote(note.id)}
              />
            ))
            : <div className="world-workspace__empty"><IconSparkles size={20} /><span>Your next great idea can start as one sentence.</span></div>
        )}

        {mode === 'projects' && (
          projects.length
            ? projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                color={color}
                onUpdate={(patch) => updateProject(project.id, patch)}
                onDelete={() => deleteProject(project.id)}
              />
            ))
            : <div className="world-workspace__empty"><IconTarget size={20} /><span>Start a project, then give it one unmistakable next move.</span></div>
        )}
      </div>
    </section>
  );
}
