import { describe, expect, it } from 'vitest';
import { formatOnlineDuration, totalOnlineSeconds } from './presenceDuration';

describe('presence duration', () => {
  it('sums session durations and formats them for the admin dashboard', () => {
    expect(totalOnlineSeconds([{ startedAt: '2026-08-18T09:00:00Z', endedAt: '2026-08-18T09:30:00Z' }, { startedAt: '2026-08-18T10:00:00Z', endedAt: null }], new Date('2026-08-18T10:15:00Z'))).toBe(2700);
    expect(formatOnlineDuration(2700)).toBe('45 min');
    expect(formatOnlineDuration(3660)).toBe('1 h 1 min');
  });
});
