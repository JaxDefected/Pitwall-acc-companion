import { describe, it, expect } from 'vitest';
import { isOfflineError } from '../firebase';

describe('isOfflineError', () => {
  it('returns false for undefined or null', () => {
    expect(isOfflineError(undefined)).toBe(false);
    expect(isOfflineError(null)).toBe(false);
  });

  it('matches string errors containing keywords case-insensitively', () => {
    expect(isOfflineError('the client is OFFLINE')).toBe(true);
    expect(isOfflineError('system could not reach the server')).toBe(true);
    expect(isOfflineError('service is Unavailable')).toBe(true);
    expect(isOfflineError('Network error occurred')).toBe(true);
  });

  it('matches Error objects with message property containing keywords', () => {
    expect(isOfflineError(new Error('the client is OFFLINE'))).toBe(true);
    expect(isOfflineError(new Error('system could not reach the server'))).toBe(true);
    expect(isOfflineError({ message: 'service is Unavailable' })).toBe(true);
    expect(isOfflineError({ message: 'Network error occurred' })).toBe(true);
  });

  it('coerces errors without a message property to string', () => {
    // String coercion of an object is "[object Object]", so this wouldn't have the keywords.
    // However, if we pass something that when converted to string has the keyword, it should work.
    expect(isOfflineError({ toString: () => 'network issue' })).toBe(true);

    // Testing boolean which converts to string "true" / "false"
    expect(isOfflineError(true)).toBe(false);

    // Number
    expect(isOfflineError(123)).toBe(false);
  });

  it('returns false for errors that do not contain the keywords', () => {
    expect(isOfflineError('permission denied')).toBe(false);
    expect(isOfflineError(new Error('unauthenticated'))).toBe(false);
    expect(isOfflineError({ message: 'invalid argument' })).toBe(false);
    expect(isOfflineError({})).toBe(false);
  });
});
