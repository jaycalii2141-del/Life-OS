import { describe, expect, it } from 'vitest';
import {
  withoutRetiredOnaBrands,
  withoutRetiredOnaCaptures,
  withoutRetiredOnaContent,
  withoutRetiredOnaFolders,
  withoutRetiredOnaMissions,
  withoutRetiredOnaQuests,
  withoutRetiredOnaTimeline,
} from '../retiredOna.js';

describe('retired ONA compatibility filters', () => {
  it('removes the retired workspace from folders, brands, quests, missions, and schedules', () => {
    expect(withoutRetiredOnaFolders([
      { id: 1, name: 'ONA', domain: 'ona' },
      { id: 2, name: 'Podium', domain: 'podium' },
    ])).toEqual([{ id: 2, name: 'Podium', domain: 'podium' }]);

    expect(withoutRetiredOnaBrands([
      { id: 'ona', name: 'ONA Elite' },
      { id: 'jaymuvs', name: 'JayMuvs' },
    ])).toEqual([{ id: 'jaymuvs', name: 'JayMuvs' }]);

    expect(withoutRetiredOnaQuests([
      { id: 'scale-ona', title: 'Scale ONA' },
      { id: 'podium-launch', title: 'Launch Podium' },
    ])).toHaveLength(1);

    expect(withoutRetiredOnaMissions([
      { id: 'ona-stale', title: 'Call stale leads' },
      { id: 'podium-builds', title: 'Ship a build' },
    ])).toEqual([{ id: 'podium-builds', title: 'Ship a build' }]);

    expect(withoutRetiredOnaTimeline([
      { time: '10:00', label: 'Session at Obstacle Ninja Academy', kind: 'Train' },
      { time: '13:00', label: 'Podium build review', kind: 'Build' },
    ])).toHaveLength(1);
  });

  it('preserves capture text while neutralizing a retired tag and archiving retired routing', () => {
    const [tagged, routed] = withoutRetiredOnaCaptures([
      { id: 1, text: 'Keep this historical thought', tag: 'ona', status: 'inbox' },
      { id: 2, text: 'Keep this routed note', tag: 'task', domain: 'ona', status: 'triaged' },
    ]);

    expect(tagged).toMatchObject({ text: 'Keep this historical thought', tag: 'idea', status: 'inbox' });
    expect(routed).toMatchObject({ text: 'Keep this routed note', status: 'archived' });
    expect(routed.domain).toBeUndefined();
  });

  it('removes retired brand-owned content without touching other content', () => {
    const content = withoutRetiredOnaContent({
      brands: [{ id: 'ona', name: 'ONA' }, { id: 'jk', name: 'JK Acro' }],
      items: [{ id: 1, brandId: 'ona' }, { id: 2, brandId: 'jk' }],
      hooks: ['still here'],
    });
    expect(content.brands.map((brand) => brand.id)).toEqual(['jk']);
    expect(content.items.map((item) => item.id)).toEqual([2]);
    expect(content.hooks).toEqual(['still here']);
  });
});
