import { describe, it, expect } from 'vitest';
import { cars } from '../../data/cars';
import { ACC_CARS, ACC_TRACKS } from '../accParser';

describe('ACC_CARS ↔ cars.ts alignment', () => {
  it('every ACC_CARS key has a matching entry in cars', () => {
    const missingKeys: string[] = [];
    for (const key of Object.keys(ACC_CARS)) {
      if (!cars[key]) {
        missingKeys.push(key);
      }
    }
    expect(
      missingKeys,
      `ACC_CARS keys missing from cars.ts: ${missingKeys.join(', ')}`
    ).toEqual([]);

    for (const key of Object.keys(ACC_CARS)) {
      expect(cars[key], `Expected cars['${key}'] to exist`).toBeDefined();
    }
  });

  it('every car in cars.ts has a display name in ACC_CARS', () => {
    const missingKeys: string[] = [];
    for (const key of Object.keys(cars)) {
      if (!ACC_CARS[key]) {
        missingKeys.push(key);
      }
    }
    expect(
      missingKeys,
      `Cars in cars.ts missing a display name in ACC_CARS: ${missingKeys.join(', ')}`
    ).toEqual([]);
  });

  it('ACC_CARS display names are non-empty strings', () => {
    for (const [key, name] of Object.entries(ACC_CARS)) {
      expect(typeof name, `Expected display name for '${key}' to be a string`).toBe('string');
      expect(name.trim().length, `Expected non-empty display name for '${key}'`).toBeGreaterThan(0);
    }
  });

  it('ACC_CARS has no unexpected duplicate display names', () => {
    // These are intentional aliases — same car, different key names
    const knownAliasNames = new Set([
      'Aston Martin V12 Vantage GT3',   // aston_martin_v12_vantage_gt3 + amr_v12_vantage_gt3
      'Porsche 718 Cayman GT4 CS',      // porsche_718_cayman_gt4_mr + porsche_718_cayman_gt4_cs
      'Aston Martin Vantage GT4',       // amr_v8_vantage_gt4 + aston_martin_vantage_gt4
    ]);
    const names = Object.values(ACC_CARS);
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const name of names) {
      if (seen.has(name) && !knownAliasNames.has(name)) {
        duplicates.push(name);
      } else {
        seen.add(name);
      }
    }
    expect(
      duplicates,
      `Unexpected duplicate display names found in ACC_CARS: ${duplicates.join(', ')}`
    ).toEqual([]);
  });
});

describe('ACC_TRACKS validation', () => {
  it('all track keys are lowercase with underscores', () => {
    for (const key of Object.keys(ACC_TRACKS)) {
      expect(key, `Track key '${key}' does not match lowercase with underscores pattern`).toMatch(
        /^[a-z0-9_]+$/
      );
    }
  });

  it('all track display names are non-empty strings', () => {
    for (const [key, name] of Object.entries(ACC_TRACKS)) {
      expect(typeof name, `Expected display name for track '${key}' to be a string`).toBe('string');
      expect(name.trim().length, `Expected non-empty display name for track '${key}'`).toBeGreaterThan(0);
    }
  });

  it('no duplicate track display names', () => {
    const names = Object.values(ACC_TRACKS);
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const name of names) {
      if (seen.has(name)) {
        duplicates.push(name);
      } else {
        seen.add(name);
      }
    }
    expect(
      duplicates,
      `Duplicate display names found in ACC_TRACKS: ${duplicates.join(', ')}`
    ).toEqual([]);
  });
});

describe('Car data property completeness', () => {
  it('every car has all critical properties for parser', () => {
    const criticalScalarOrRangeProps = [
      'tyrePressureRange',
      'tyrePressureStep',
      'camberFrontRange',
      'camberRearRange',
      'camberStep',
      'toeFrontRange',
      'toeRearRange',
      'toeStep',
      'brakeBiasRange',
      'brakeBiasStep',
      'brakeTorqueRange',
      'brakeTorqueStep',
      'steerRatioRange',
      'steerRatioStep',
      'rideHeightFrontRange',
      'rideHeightRearRange',
      'rearWingRange',
      'splitterRange',
    ] as const;

    const missingErrors: string[] = [];

    for (const [carKey, car] of Object.entries(cars)) {
      const missingPropsForCar: string[] = [];

      for (const prop of criticalScalarOrRangeProps) {
        if ((car as Record<string, any>)[prop] === undefined) {
          missingPropsForCar.push(prop);
        }
      }

      if (!Array.isArray(car.casterArr) || car.casterArr.length === 0) {
        missingPropsForCar.push('casterArr (empty or missing array)');
      }

      if (!Array.isArray(car.wheelRatesFront) || car.wheelRatesFront.length === 0) {
        missingPropsForCar.push('wheelRatesFront (empty or missing array)');
      }

      if (!Array.isArray(car.wheelRatesRear) || car.wheelRatesRear.length === 0) {
        missingPropsForCar.push('wheelRatesRear (empty or missing array)');
      }

      if (missingPropsForCar.length > 0) {
        missingErrors.push(`[${carKey}]: missing ${missingPropsForCar.join(', ')}`);
      }
    }

    expect(
      missingErrors,
      `Critical properties missing from car data:\n${missingErrors.join('\n')}`
    ).toEqual([]);
  });
});
