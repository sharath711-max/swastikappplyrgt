describe('documentDeliveryService secure tokens', () => {
    let documentDeliveryService;

    beforeEach(() => {
        jest.resetModules();
        process.env.DELIVERY_SIGNING_SECRET = 'unit-test-delivery-secret';
        process.env.DELIVERY_LINK_TTL_HOURS = '48';
        process.env.PUBLIC_BASE_URL = 'https://lab.example.test';
        documentDeliveryService = require('../../services/documentDeliveryService');
    });

    afterEach(() => {
        delete process.env.DELIVERY_SIGNING_SECRET;
        delete process.env.DELIVERY_LINK_TTL_HOURS;
        delete process.env.PUBLIC_BASE_URL;
    });

    it('issues a secure token and verifies the workflow payload', () => {
        const token = documentDeliveryService.issueSecureToken({
            type: 'gold',
            id: 'GTS-UNIT-1',
            autoNumber: '20260313-001'
        });

        const payload = documentDeliveryService.verifySecureToken(token);

        expect(payload.scope).toBe('workflow_delivery_document');
        expect(payload.type).toBe('gold');
        expect(payload.id).toBe('GTS-UNIT-1');
        expect(payload.autoNumber).toBe('20260313-001');
    });

    it('builds a public secure PDF URL on the configured base URL', () => {
        const url = documentDeliveryService.buildSecurePdfUrl('silver', 'STS-UNIT-1', '20260313-002');

        expect(url.startsWith('https://lab.example.test/api/public/documents/')).toBe(true);
        expect(url).toContain('/api/public/documents/');
    });
});
