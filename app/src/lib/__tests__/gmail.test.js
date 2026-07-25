import { describe, expect, it } from 'vitest';
import {
  gmailContext,
  gmailHighlights,
  gmailSyncLabel,
  recommendGmail,
} from '../gmail.js';

const pulse = {
  connected: true,
  account: 'jay@podiumcreations.com',
  lastSyncedAt: '2026-07-25T16:00:00.000Z',
  highlights: [
    { id: 'small', priority: 'medium', kind: 'admin', title: 'Monthly overview', summary: 'Review it.' },
    { id: 'lead', priority: 'high', kind: 'lead', title: 'Pacific Airshow partnership', summary: 'Clarify budget and responsibilities.' },
  ],
};

describe('Podium Gmail pulse', () => {
  it('ranks high-priority signals first and produces a mission', () => {
    expect(gmailHighlights(pulse)[0].id).toBe('lead');
    expect(recommendGmail(pulse)).toMatchObject({
      id: 'podium-email-lead',
      title: 'Pacific Airshow partnership',
      est: 20,
    });
  });

  it('keeps the JAM context compact and read-only', () => {
    const context = gmailContext(pulse);
    expect(context).toContain('jay@podiumcreations.com, read-only');
    expect(context).toContain('Pacific Airshow partnership');
  });

  it('does not create email work from disconnected or low-priority data', () => {
    expect(recommendGmail({ ...pulse, connected: false })).toBeNull();
    expect(recommendGmail({
      ...pulse,
      highlights: [{ id: 'info', priority: 'low', title: 'Newsletter' }],
    })).toBeNull();
  });

  it('formats the sync age without exposing implementation details', () => {
    expect(gmailSyncLabel(pulse, new Date('2026-07-25T16:12:00.000Z'))).toBe('Synced 12m ago');
  });
});
