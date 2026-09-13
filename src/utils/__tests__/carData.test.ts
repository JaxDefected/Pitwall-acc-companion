import { describe, it, expect } from 'vitest';
import { cars } from '../../data/cars';
import type { CarSetupConfig } from '../../data/cars';

describe('Car Data Integrity', () => {
  for (const [carKey, car] of Object.entries(cars)) {
    describe(carKey, () => {
      it('has required identity fields', () => {
        expect(typeof car.fullName).toBe('string');
        expect(car.fullName.trim().length).toBeGreaterThan(0);
        expect(car.year).toBeGreaterThanOrEqual(2015);
        expect(car.year).toBeLessThanOrEqual(2025);
        const validCategories = ['gt2', 'gt3', 'gt4', 'cup', 'st', 'chl', 'tcx'];
        expect(validCategories).toContain(car.category);
      });

      it('has valid tyre pressure config', () => {
        expect(car.tyrePressureRange).toBeDefined();
        expect(Array.isArray(car.tyrePressureRange)).toBe(true);
        expect(car.tyrePressureRange).toHaveLength(2);
        expect(car.tyrePressureRange![0]).toBeLessThan(car.tyrePressureRange![1]);
        expect(car.tyrePressureStep).toBe(0.1);
      });

      it('has valid camber config', () => {
        expect(car.camberFrontRange).toBeDefined();
        expect(car.camberRearRange).toBeDefined();
        expect(car.camberFrontRange![0]).toBeLessThan(car.camberFrontRange![1]);
        expect(car.camberRearRange![0]).toBeLessThan(car.camberRearRange![1]);
        expect(car.camberStep).toBe(0.1);
      });

      it('has valid toe config', () => {
        expect(car.toeFrontRange).toBeDefined();
        expect(car.toeRearRange).toBeDefined();
        expect(car.toeStep).toBe(0.01);
      });

      it('has valid caster config', () => {
        expect(car.casterArr).toBeDefined();
        expect(Array.isArray(car.casterArr)).toBe(true);
        expect(car.casterArr!.length).toBeGreaterThanOrEqual(5);

        for (let i = 1; i < car.casterArr!.length; i++) {
          expect(car.casterArr![i]).toBeGreaterThanOrEqual(car.casterArr![i - 1]);
        }

        const uniqueValues = new Set(car.casterArr);
        expect(uniqueValues.size).toBe(car.casterArr!.length);
      });

      it('has valid brake config', () => {
        expect(car.brakeBiasRange).toBeDefined();
        expect(car.brakeBiasRange![0]).toBeLessThan(car.brakeBiasRange![1]);
        expect([0.2, 0.3]).toContain(car.brakeBiasStep);
        expect(car.brakeTorqueRange).toEqual([80, 100]);
      });

      it('has valid steer ratio config', () => {
        expect(car.steerRatioRange).toBeDefined();
        expect(car.steerRatioRange![0]).toBeLessThan(car.steerRatioRange![1]);
        expect(car.steerRatioStep).toBe(1);
      });

      it('has valid wheel rates', () => {
        expect(car.wheelRatesFront).toBeDefined();
        expect(Array.isArray(car.wheelRatesFront)).toBe(true);
        expect(car.wheelRatesFront!.length).toBeGreaterThanOrEqual(1);
        for (let i = 1; i < car.wheelRatesFront!.length; i++) {
          expect(car.wheelRatesFront![i]).toBeGreaterThanOrEqual(car.wheelRatesFront![i - 1]);
        }

        expect(car.wheelRatesRear).toBeDefined();
        expect(Array.isArray(car.wheelRatesRear)).toBe(true);
        expect(car.wheelRatesRear!.length).toBeGreaterThanOrEqual(1);
        for (let i = 1; i < car.wheelRatesRear!.length; i++) {
          expect(car.wheelRatesRear![i]).toBeGreaterThanOrEqual(car.wheelRatesRear![i - 1]);
        }
      });

      it('has valid ride height config', () => {
        expect(car.rideHeightFrontRange).toBeDefined();
        expect(car.rideHeightRearRange).toBeDefined();
        expect(car.rideHeightFrontRange![0]).toBeLessThan(car.rideHeightFrontRange![1]);
        expect(car.rideHeightRearRange![0]).toBeLessThan(car.rideHeightRearRange![1]);
      });

      it('has valid Nordschleife ride heights', () => {
        if (car.rideHeightFrontRange_n24h !== undefined) {
          expect(car.rideHeightFrontRange_n24h[0]).toBeLessThan(car.rideHeightFrontRange_n24h[1]);
        }
        if (car.rideHeightRearRange_n24h !== undefined) {
          expect(car.rideHeightRearRange_n24h[0]).toBeLessThan(car.rideHeightRearRange_n24h[1]);
        }
      });

      it('has valid bump stop config', () => {
        const hasValidBumpStopRateRange =
          car.bumpStopRateRange !== undefined &&
          car.bumpStopRateRange[0] < car.bumpStopRateRange[1];

        const hasSplitAxleBumpStopRates =
          car.bumpStopFrontRateRange !== undefined &&
          car.bumpStopRearRateRange !== undefined;

        expect(hasValidBumpStopRateRange || hasSplitAxleBumpStopRates).toBe(true);
      });

      it('has valid preload config', () => {
        expect(car.preloadRange).toBeDefined();
        expect(Array.isArray(car.preloadRange)).toBe(true);
        expect(car.preloadRange).toHaveLength(2);
        expect(car.preloadStep).toBeDefined();

        const isZeroPreload = car.preloadRange![0] === 0 && car.preloadRange![1] === 0;
        if (isZeroPreload) {
          expect(car.preloadStep).toBeGreaterThanOrEqual(0);
        } else {
          expect(car.preloadStep).toBeGreaterThan(0);
        }
      });

      it('has valid aero config', () => {
        expect(car.rearWingRange).toBeDefined();
        expect(car.rearWingRange![0]).toBeLessThanOrEqual(car.rearWingRange![1]);
        expect(car.splitterRange).toBeDefined();
      });

      it('has valid antiroll bar config', () => {
        expect(car.antirollBarFrontRange).toBeDefined();
        expect(car.antirollBarRearRange).toBeDefined();
        expect(car.antirollBarFrontRange![0]).toBeLessThanOrEqual(car.antirollBarFrontRange![1]);
        expect(car.antirollBarRearRange![0]).toBeLessThanOrEqual(car.antirollBarRearRange![1]);
      });
    });
  }
});
