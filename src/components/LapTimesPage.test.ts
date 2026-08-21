import { describe, it, expect } from 'vitest';
import { secondsToLapTime } from './LapTimesPage';

describe('secondsToLapTime', () => {
  it('returns "—" for null or undefined', () => {
    expect(secondsToLapTime(null)).toBe('—');
    expect(secondsToLapTime(undefined)).toBe('—');
  });

  it('formats exactly 0 seconds correctly', () => {
    expect(secondsToLapTime(0)).toBe('0:00.000');
  });

  it('formats sub-minute times correctly', () => {
    expect(secondsToLapTime(45.123)).toBe('0:45.123');
    expect(secondsToLapTime(9.001)).toBe('0:09.001');
    expect(secondsToLapTime(0.5)).toBe('0:00.500');
  });

  it('formats exactly one minute correctly', () => {
    expect(secondsToLapTime(60)).toBe('1:00.000');
  });

  it('formats times greater than one minute correctly', () => {
    expect(secondsToLapTime(92.456)).toBe('1:32.456');
    expect(secondsToLapTime(125)).toBe('2:05.000');
  });

  it('handles rounding/padding of decimals properly', () => {
    expect(secondsToLapTime(65.1)).toBe('1:05.100');
    expect(secondsToLapTime(65.12)).toBe('1:05.120');
    expect(secondsToLapTime(65.1234)).toBe('1:05.123');
  });

  it('handles minute rollover when rounding up', () => {
    expect(secondsToLapTime(59.9996)).toBe('1:00.000');
    expect(secondsToLapTime(119.9999)).toBe('2:00.000');
  });
});
