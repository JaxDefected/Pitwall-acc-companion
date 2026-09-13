import { describe, it, expect } from 'vitest';
import { parseAccSetup } from '../accParser';
import amrV8Setup from './fixtures/amr_v8_test.json';

describe('AMR V8 Vantage GT3 — Golden File Test', () => {
  const result = parseAccSetup(amrV8Setup);

  it('identifies car correctly', () => {
    expect(result.carKey).toBe('amr_v8_vantage_gt3');
    expect(result.carName).toBe('Aston Martin Vantage V8 GT3');
  });

  it('parses tyre pressures', () => {
    expect(result.tyrePressures).toHaveLength(4);
    expect(result.tyrePressures[0]).toBeCloseTo(25.3, 1);
    expect(result.tyrePressures[1]).toBeCloseTo(26.7, 1);
    expect(result.tyrePressures[2]).toBeCloseTo(25.5, 1);
    expect(result.tyrePressures[3]).toBeCloseTo(26.5, 1);
    expect(result.tyrePressures).toEqual([25.3, 26.7, 25.5, 26.5]);
  });

  it('parses cambers', () => {
    expect(result.cambers).toHaveLength(4);
    expect(result.cambers[0]).toBeCloseTo(-4.0, 1);
    expect(result.cambers[1]).toBeCloseTo(-4.0, 1);
    expect(result.cambers[2]).toBeCloseTo(-3.5, 1);
    expect(result.cambers[3]).toBeCloseTo(-3.5, 1);
    expect(result.cambers).toEqual([-4.0, -4.0, -3.5, -3.5]);
  });

  it('parses toes', () => {
    expect(result.toes).toHaveLength(4);
    expect(result.toes[0]).toBeCloseTo(-0.4, 2);
    expect(result.toes[1]).toBeCloseTo(-0.4, 2);
    expect(result.toes[2]).toBeCloseTo(-0.4, 2);
    expect(result.toes[3]).toBeCloseTo(-0.4, 2);
    expect(result.toes).toEqual([-0.4, -0.4, -0.4, -0.4]);
  });

  it('parses casters', () => {
    expect(result.casters).toHaveLength(2);
    expect(result.casters[0]).toBeCloseTo(13.1, 1);
    expect(result.casters[1]).toBeCloseTo(13.1, 1);
    expect(result.casters).toEqual([13.1, 13.1]);
  });

  it('parses steer ratio', () => {
    expect(result.steerRatio).toBe(15);
  });

  it('parses electronics', () => {
    expect(result.tc1).toBe(2);
    expect(result.tc2).toBe(8);
    expect(result.abs).toBe(5);
    expect(result.ecuMap).toBe(1);
  });

  it('parses fuel', () => {
    expect(result.fuel).toBe(12);
  });

  it('parses brake power', () => {
    expect(result.brakePower).toBe(100);
  });

  it('parses brake bias', () => {
    expect(result.brakeBias).toBeCloseTo(62.2, 1);
    expect(result.brakeBias).toBe(62.2);
  });

  it('parses antiroll bars', () => {
    expect(result.arbFront).toBe(4);
    expect(result.arbRear).toBe(5);
  });

  it('parses wheel rates', () => {
    expect(result.wheelRates).toEqual([135000, 135000, 155000, 155000]);
  });

  it('parses bumpstop rates', () => {
    expect(result.bumpstopRates).toEqual([900, 900, 800, 800]);
  });

  it('parses bumpstop windows', () => {
    expect(result.bumpstopRanges).toEqual([10, 10, 0, 0]);
  });

  it('parses preload', () => {
    expect(result.preloadDifferential).toBe(90);
  });

  it('consolidates ride heights to [front, rear]', () => {
    expect(result.rideHeights).toHaveLength(2);
    expect(result.rideHeights[0]).toBe(57);
    expect(result.rideHeights[1]).toBe(79);
    expect(result.rideHeights).toEqual([57, 79]);
  });

  it('parses rear wing', () => {
    expect(result.rearWing).toBe(10);
  });

  it('parses splitter', () => {
    expect(result.splitter).toBe(0);
  });

  it('parses brake ducts', () => {
    expect(result.brakeDucts).toEqual([5, 3]);
  });

  it('parses dampers', () => {
    expect(result.bumpSlow).toEqual([4, 4, 0, 0]);
    expect(result.bumpFast).toEqual([49, 49, 49, 49]);
    expect(result.reboundSlow).toEqual([40, 40, 40, 40]);
    expect(result.reboundFast).toEqual([49, 49, 49, 49]);
  });
});

describe('Edge Cases', () => {
  it('handles unknown car gracefully', () => {
    const res = parseAccSetup({ carName: 'fake_car_123' });
    expect(res.isUnsupportedCar).toBe(true);
    expect(res.validationWarnings).toBeDefined();
    expect(res.validationWarnings!.length).toBeGreaterThan(0);
  });

  it('handles empty input', () => {
    const res = parseAccSetup({});
    expect(res).toBeDefined();
    expect(res.carKey).toBe('unknown');
    expect(res.fuel).toBe(20);
    expect(res.tyrePressures).toEqual([26.8, 26.8, 26.8, 26.8]);
  });

  it('handles null input', () => {
    const res = parseAccSetup(null);
    expect(res).toBeDefined();
    expect(res.carKey).toBe('unknown');
    expect(res.carName).toBe('Unknown GT3/GT4 Car');
    expect(res.fuel).toBe(20);
    expect(res.tyrePressures).toEqual([26.8, 26.8, 26.8, 26.8]);
  });

  it('handles missing sections', () => {
    const res = parseAccSetup({ carName: 'amr_v8_vantage_gt3' });
    expect(res.carKey).toBe('amr_v8_vantage_gt3');
    expect(res.carName).toBe('Aston Martin Vantage V8 GT3');
    expect(res.fuel).toBe(20);
    expect(res.tc1).toBe(3);
    expect(res.tyrePressures).toEqual([26.8, 26.8, 26.8, 26.8]);
  });

  it('passes through absolute tyre pressures', () => {
    const absolutePressures = [125.5, 126.0, 125.5, 126.0];
    const res = parseAccSetup({
      basicSetup: {
        tyres: {
          tyrePressure: absolutePressures
        }
      }
    });
    expect(res.tyrePressures).toEqual(absolutePressures);
  });
});

describe('Ride height edge cases', () => {
  it('2-element ride height array maps correctly', () => {
    const res = parseAccSetup({
      carName: 'amr_v8_vantage_gt3',
      advancedSetup: {
        aeroBalance: {
          rideHeight: [5, 10]
        }
      }
    });
    expect(res.rideHeights).toEqual([58, 63]);
  });

  it('4-element ride height averages correctly with equal L/R', () => {
    const res = parseAccSetup({
      carName: 'amr_v8_vantage_gt3',
      advancedSetup: {
        aeroBalance: {
          rideHeight: [5, 5, 10, 10]
        }
      }
    });
    expect(res.rideHeights).toEqual([58, 63]);
  });

  it('4-element ride height averages correctly with unequal L/R', () => {
    const res = parseAccSetup({
      carName: 'amr_v8_vantage_gt3',
      advancedSetup: {
        aeroBalance: {
          rideHeight: [0, 10, 20, 30]
        }
      }
    });
    expect(res.rideHeights).toEqual([58, 78]);
  });
});
