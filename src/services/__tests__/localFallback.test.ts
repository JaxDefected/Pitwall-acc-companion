import { describe, it, expect } from 'vitest';
import { resolveScenario } from '../localFallback';

describe('resolveScenario', () => {
  it('should return phase for tyre issue type', () => {
    expect(resolveScenario('tyre', 'tyre_overheat')).toBe('tyre_overheat');
    expect(resolveScenario('tyre', 'tyre_cold')).toBe('tyre_cold');
    expect(resolveScenario('tyre', 'tyre_pressure')).toBe('tyre_pressure');
  });

  it('should return phase for brakes issue type', () => {
    expect(resolveScenario('brakes', 'brake_front_lock')).toBe('brake_front_lock');
    expect(resolveScenario('brakes', 'brake_rear_lock')).toBe('brake_rear_lock');
  });

  it('should return phase for other issue type', () => {
    expect(resolveScenario('other', 'bouncing_kerbs')).toBe('bouncing_kerbs');
    expect(resolveScenario('other', 'lift_off_oversteer')).toBe('lift_off_oversteer');
    expect(resolveScenario('other', 'low_top_speed')).toBe('low_top_speed');
  });

  it('should return concatenated string for oversteer/understeer issue types', () => {
    expect(resolveScenario('oversteer', 'braking', 'high')).toBe('oversteer_braking_high');
    expect(resolveScenario('understeer', 'release', 'low')).toBe('understeer_release_low');
    expect(resolveScenario('oversteer', 'coast', 'high')).toBe('oversteer_coast_high');
    expect(resolveScenario('understeer', 'exit', 'low')).toBe('understeer_exit_low');
  });

  it('should return concatenated string even if phase or speed is undefined', () => {
    expect(resolveScenario('oversteer', undefined, 'high')).toBe('oversteer_undefined_high');
    expect(resolveScenario('understeer', 'braking', undefined)).toBe('understeer_braking_undefined');
    expect(resolveScenario('oversteer', undefined, undefined)).toBe('oversteer_undefined_undefined');
  });

  it('should return undefined if phase is undefined for tyre, brakes, or other', () => {
    expect(resolveScenario('tyre')).toBeUndefined();
    expect(resolveScenario('brakes')).toBeUndefined();
    expect(resolveScenario('other')).toBeUndefined();
  });
});
