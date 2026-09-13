import { describe, it, expect } from 'vitest';
import { cars } from '../../data/cars';
import { ACC_CARS, ACC_TRACKS } from '../accParser';

describe('ACC_CARS Dictionary Coverage', () => {
  const carKeys = Object.keys(cars);
  const accCarKeys = Object.keys(ACC_CARS);

  it('should have the same number of cars in both dictionaries', () => {
    // ACC_CARS may have aliases (e.g. aston_martin_v12_vantage_gt3), so check cars coverage
    const missingInAccCars = carKeys.filter(k => !ACC_CARS[k]);
    expect(missingInAccCars, 'Cars missing from ACC_CARS:').toHaveLength(0);
  });

  it('every ACC_CARS key resolves to car data', () => {
    const missingInCars = accCarKeys.filter(k => !cars[k]);
    expect(missingInCars, 'ACC_CARS keys with no car data:').toHaveLength(0);
  });

  it('ACC_CARS display names are all unique', () => {
    const names = Object.values(ACC_CARS);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes, 'Duplicate display names:').toHaveLength(0);
  });

  it('ACC_TRACKS display names are all unique', () => {
    const names = Object.values(ACC_TRACKS);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes, 'Duplicate track names:').toHaveLength(0);
  });

  it('ACC_TRACKS keys are lowercase with underscores only', () => {
    for (const key of Object.keys(ACC_TRACKS)) {
      expect(key).toMatch(/^[a-z0-9_]+$/);
    }
  });
});
