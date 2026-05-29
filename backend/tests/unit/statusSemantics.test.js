const {
    PYTHON_TO_SERN_STATUS,
    SERN_TO_PYTHON_STATUS,
    STATUS_SEMANTICS,
    toNodeStatus,
    toPythonStatus,
} = require('../../config/statusSemantics');

describe('Status Semantics Register', () => {
    test('maps Python workflow states by operator expectation', () => {
        expect(PYTHON_TO_SERN_STATUS).toEqual({
            ongoing: 'TODO',
            pending: 'IN_PROGRESS',
            completed: 'DONE',
        });
    });

    test('round-trips SERN statuses back to Python labels', () => {
        expect(SERN_TO_PYTHON_STATUS).toEqual({
            TODO: 'ongoing',
            IN_PROGRESS: 'pending',
            DONE: 'completed',
        });
        expect(toPythonStatus('TODO')).toBe('ongoing');
        expect(toPythonStatus('IN_PROGRESS')).toBe('pending');
        expect(toPythonStatus('DONE')).toBe('completed');
    });

    test('documents next operator action for each migrated state', () => {
        expect(STATUS_SEMANTICS.ongoing.nextOperatorAction).toMatch(/Add results/);
        expect(STATUS_SEMANTICS.pending.nextOperatorAction).toMatch(/finalize/);
        expect(STATUS_SEMANTICS.completed.nextOperatorAction).toMatch(/audited correction/);
    });

    test('strict migration mapping rejects unknown states', () => {
        expect(() => toNodeStatus('tested', { strict: true })).toThrow(/Unknown Python workflow status/);
    });
});
