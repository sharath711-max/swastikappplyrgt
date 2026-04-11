import { preventDuplicateCreate } from '../../../utils/certificateGuard';

describe('preventDuplicateCreate', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('blocks duplicate create calls for the same type and customer within the guard window', () => {
        expect(preventDuplicateCreate('GC', 'CUST-1')).toBe(true);
        expect(preventDuplicateCreate('GC', 'CUST-1')).toBe(false);

        jest.advanceTimersByTime(100);

        expect(preventDuplicateCreate('GC', 'CUST-1')).toBe(true);
    });

    test('rapid reopen works correctly with reduced timeout', () => {
        // First open
        expect(preventDuplicateCreate('GC', 'CUST-X')).toBe(true);
        // Instant secondary open fails (double-click guard)
        expect(preventDuplicateCreate('GC', 'CUST-X')).toBe(false);
        
        // Wait just 100ms (simulate rapid manual close -> open)
        jest.advanceTimersByTime(100);
        
        // Should succeed now
        expect(preventDuplicateCreate('GC', 'CUST-X')).toBe(true);
    });
});
