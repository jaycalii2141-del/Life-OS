import { describe, expect, it } from 'vitest';
import {
  createWorkspaceIdea,
  createWorkspaceProject,
  findWorkspaceFolder,
  nextProjectStatus,
  nextWorkspaceStep,
  updateWorkspaceFolder,
  workspaceProjectProgress,
} from '../worldWorkspace.js';

const meta = {
  domain: 'podium',
  name: 'Podium',
  color: '#E9C46A',
  emoji: '🏆',
  aliases: ['podium'],
};

describe('World workspace data', () => {
  it('updates an existing legacy folder without disturbing other worlds', () => {
    const movement = { id: 1, domain: 'movement', name: 'Movement', notes: [], projects: [] };
    const legacyPodium = { id: 2, name: 'Podium', notes: [], projects: [] };
    const result = updateWorkspaceFolder([movement, legacyPodium], meta, (folder) => ({
      ...folder,
      notes: [createWorkspaceIdea('AXIS riser concept', 10)],
    }));

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(movement);
    expect(result[1].notes[0]).toMatchObject({ id: 'idea-10', title: 'AXIS riser concept' });
  });

  it('creates a missing world the first time something is captured', () => {
    const result = updateWorkspaceFolder([], {
      domain: 'adventure',
      name: 'Explore',
      color: '#7D8CFF',
      emoji: '🌎',
      aliases: ['explore'],
    }, (folder) => ({
      ...folder,
      projects: [createWorkspaceProject('Train in Japan', 20)],
    }));

    expect(findWorkspaceFolder(result, 'adventure')).toMatchObject({
      name: 'Explore',
      projects: [{ id: 'project-20', title: 'Train in Japan', status: 'active' }],
    });
  });

  it('tracks project status, progress, and the next unfinished move', () => {
    const project = {
      status: 'active',
      steps: [
        { id: 1, text: 'Sketch it', done: true },
        { id: 2, text: 'Price materials', done: false },
      ],
    };

    expect(workspaceProjectProgress(project)).toBe(50);
    expect(nextWorkspaceStep(project)?.text).toBe('Price materials');
    expect(nextProjectStatus('active')).toBe('waiting');
    expect(nextProjectStatus('done')).toBe('idea');
  });
});
