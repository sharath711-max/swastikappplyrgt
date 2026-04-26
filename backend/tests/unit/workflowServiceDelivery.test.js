jest.mock('../../services/v2/testService', () => ({
    updateStatus: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../services/v2/certificateService', () => ({
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

const testServiceV2 = require('../../services/v2/testService');
const documentDeliveryService = require('../../services/documentDeliveryService');
const workflowService = require('../../services/workflowService');

describe('workflowService completion delivery', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects DONE status — finalization requires the explicit finalizeItem flow', async () => {
        await expect(workflowService.updateStatus('gold', 'GTS-100', 'DONE'))
            .rejects.toMatchObject({
                message: 'Finalization requires explicit completion logic',
                statusCode: 403,
            });

        expect(testServiceV2.updateStatus).not.toHaveBeenCalled();
        expect(documentDeliveryService.deliverCompletedRecord).not.toHaveBeenCalled();
    });

    it('does not trigger customer delivery for non-DONE status changes', async () => {
        const result = await workflowService.updateStatus('gold', 'GTS-200', 'IN_PROGRESS');

        expect(testServiceV2.updateStatus).toHaveBeenCalledWith('gold', 'GTS-200', 'IN_PROGRESS');
        expect(documentDeliveryService.deliverCompletedRecord).not.toHaveBeenCalled();
        expect(result.delivery).toBeUndefined();
    });

    it('returns { updated: true } without triggering delivery for any non-DONE status', async () => {
        const result = await workflowService.updateStatus('gold', 'GTS-300', 'IN_PROGRESS');

        expect(testServiceV2.updateStatus).toHaveBeenCalledWith('gold', 'GTS-300', 'IN_PROGRESS');
        expect(result.updated).toBe(true);
        expect(documentDeliveryService.deliverCompletedRecord).not.toHaveBeenCalled();
    });
});
