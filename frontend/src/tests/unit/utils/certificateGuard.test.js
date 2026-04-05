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

        jest.advanceTimersByTime(500);

        expect(preventDuplicateCreate('GC', 'CUST-1')).toBe(true);
    });
});
