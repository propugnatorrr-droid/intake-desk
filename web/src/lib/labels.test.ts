import { describe, expect, it } from 'vitest';
import { STATUS_LABEL, STATUS_ORDER, formatWhen } from './labels';

describe('formatWhen', () => {
  const now = new Date('2026-11-21T12:00:00Z');

  it('says just now for the last minute', () => {
    expect(formatWhen('2026-11-21T11:59:40Z', now)).toBe('Just now');
  });

  it('uses minutes, hours and days as the gap grows', () => {
    expect(formatWhen('2026-11-21T11:30:00Z', now)).toBe('30 min ago');
    expect(formatWhen('2026-11-21T07:00:00Z', now)).toBe('5 h ago');
    expect(formatWhen('2026-11-18T12:00:00Z', now)).toBe('3 d ago');
  });

  it('falls back to a calendar date after a week', () => {
    expect(formatWhen('2026-10-01T12:00:00Z', now)).toBe('1 Oct 2026');
  });
});

describe('status labels', () => {
  it('has a label for every status in the workflow order', () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_LABEL[status]).toBeTruthy();
    }
    expect(STATUS_ORDER).toHaveLength(5);
  });
});
