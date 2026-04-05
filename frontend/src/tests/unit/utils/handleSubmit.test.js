import handleSubmit from '../../../utils/handleSubmit';

describe('handleSubmit modal sequencing', () => {
    test('awaits action and reload before closing', async () => {
        const events = [];
        const action = jest.fn(async () => {
            events.push('action');
            return 'created-record';
        });
        const reload = jest.fn(async (result) => {
            events.push(`reload:${result}`);
        });
        const close = jest.fn(() => {
            events.push('close');
        });

        const result = await handleSubmit({ action, reload, close });

        expect(result).toBe('created-record');
        expect(events).toEqual(['action', 'reload:created-record', 'close']);
    });
});
