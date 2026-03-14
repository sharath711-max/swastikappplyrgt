jest.mock('../../services/goldTestService', () => ({
    updateStatus: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../services/silverTestService', () => ({
    updateStatus: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../services/certificateService', () => ({
    updateStatus: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../services/documentDeliveryService', () => ({
    deliverCompletedRecord: jest.fn().mockResolvedValue({
        ok: true,
        message: 'Moved to Completed and sent the secure receipt packet to the customer phone.'
    })
}));

jest.mock('../../utils/logger', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
}));

const goldTestService = require('../../services/goldTestService');
const documentDeliveryService = require('../../services/documentDeliveryService');
const workflowService = require('../../services/workflowService');

describe('workflowService completion delivery', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns delivery metadata when a record reaches DONE', async () => {
        const result = await workflowService.updateStatus('gold', 'GTS-100', 'DONE');

        expect(goldTestService.updateStatus).toHaveBeenCalledWith('GTS-100', 'DONE');
        expect(documentDeliveryService.deliverCompletedRecord).toHaveBeenCalledWith('gold', 'GTS-100');
        expect(result.delivery).toEqual(expect.objectContaining({ ok: true }));
    });

    it('does not trigger customer delivery for non-DONE status changes', async () => {
        const result = await workflowService.updateStatus('gold', 'GTS-200', 'IN_PROGRESS');

        expect(goldTestService.updateStatus).toHaveBeenCalledWith('GTS-200', 'IN_PROGRESS');
        expect(documentDeliveryService.deliverCompletedRecord).not.toHaveBeenCalled();
        expect(result.delivery).toBeUndefined();
    });

    it('keeps the status update successful when secure delivery fails', async () => {
        documentDeliveryService.deliverCompletedRecord.mockRejectedValueOnce(new Error('provider offline'));

        const result = await workflowService.updateStatus('gold', 'GTS-300', 'DONE');

        expect(goldTestService.updateStatus).toHaveBeenCalledWith('GTS-300', 'DONE');
        expect(result.updated).toBe(true);
        expect(result.delivery).toEqual(expect.objectContaining({
            ok: false,
            error: 'provider offline'
        }));
    });
});
