export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
  status: "upcoming" | "starting_soon" | "live" | "completed";
}

/**
 * Calculates countdown components and status transitions given a target race date.
 * 
 * Status transitions:
 * - 'upcoming': more than 1 hour until race
 * - 'starting_soon': less than 1 hour until race
 * - 'live': within 2 hours after race start time
 * - 'completed': more than 2 hours after race start time
 */
export function calculateCountdown(targetIsoDate: string, currentTimestamp = Date.now()): CountdownResult {
  if (!targetIsoDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isExpired: true,
      status: "completed",
    };
  }

  const target = new Date(targetIsoDate).getTime();
  const diff = target - currentTimestamp;

  if (isNaN(diff)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isExpired: true,
      status: "completed",
    };
  }

  const twoHoursMs = 2 * 60 * 60 * 1000;
  if (diff < -twoHoursMs) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isExpired: true,
      status: "completed",
    };
  }

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isExpired: true,
      status: "live",
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const status = diff < 60 * 60 * 1000 ? "starting_soon" : "upcoming";

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: diff,
    isExpired: false,
    status,
  };
}
