import { describe, it, expect } from "vitest";
import { calculateCountdown } from "../../utils/countdown";

describe("calculateCountdown", () => {
  const BASE_NOW = new Date("2026-11-20T10:00:00Z").getTime();

  it("calculates exact days, hours, minutes, and seconds remaining", () => {
    // 2 days, 3 hours, 15 minutes, 30 seconds in future
    const target = new Date("2026-11-22T13:15:30Z").toISOString();
    const result = calculateCountdown(target, BASE_NOW);

    expect(result.days).toBe(2);
    expect(result.hours).toBe(3);
    expect(result.minutes).toBe(15);
    expect(result.seconds).toBe(30);
    expect(result.isExpired).toBe(false);
    expect(result.status).toBe("upcoming");
  });

  it("identifies 'starting_soon' when less than 1 hour remains", () => {
    // 45 minutes ahead
    const target = new Date("2026-11-20T10:45:00Z").toISOString();
    const result = calculateCountdown(target, BASE_NOW);

    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(45);
    expect(result.seconds).toBe(0);
    expect(result.isExpired).toBe(false);
    expect(result.status).toBe("starting_soon");
  });

  it("identifies 'live' status during the 2-hour race session window", () => {
    // Started 30 minutes ago
    const target = new Date("2026-11-20T09:30:00Z").toISOString();
    const result = calculateCountdown(target, BASE_NOW);

    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.isExpired).toBe(true);
    expect(result.status).toBe("live");
  });

  it("identifies 'completed' when race started more than 2 hours ago", () => {
    // Started 2.5 hours ago
    const target = new Date("2026-11-20T07:30:00Z").toISOString();
    const result = calculateCountdown(target, BASE_NOW);

    expect(result.days).toBe(0);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
    expect(result.isExpired).toBe(true);
    expect(result.status).toBe("completed");
  });

  it("handles empty or invalid date strings safely without throwing", () => {
    const invalid = calculateCountdown("not-a-valid-date", BASE_NOW);
    expect(invalid.isExpired).toBe(true);
    expect(invalid.status).toBe("completed");

    const empty = calculateCountdown("", BASE_NOW);
    expect(empty.isExpired).toBe(true);
    expect(empty.status).toBe("completed");
  });
});
