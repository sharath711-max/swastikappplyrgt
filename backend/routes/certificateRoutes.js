'use strict';

const express = require('express');
const router  = express.Router();

const certServiceV2          = require('../services/v2/certificateService');
const photoCertSvc           = require('../services/v2/photoCertificateService');
const upload                 = require('../middleware/uploadMiddleware');
const { generateCertificateHTML } = require('../utils/certificateTemplate');
const { authMiddleware }     = require('../middleware/authMiddleware');
const { immutabilityGuard }  = require('../middleware/immutabilityGuard');
const workflowService        = require('../services/workflowService');

// Dynamic immutability guard keyed on cert ID prefix
const dynamicCertGuard = (req, res, next) => {
    const id = req.params.id || req.body?.id;
    let tableName = null;
    if (id) {
        if (id.startsWith('GCR') || id.startsWith('GC-')) tableName = 'gold_certificate';
        else if (id.startsWith('SCR') || id.startsWith('SC-')) tableName = 'silver_certificate';
        else if (id.startsWith('PCR') || id.startsWith('PC-')) tableName = 'photo_certificate';
    }
    return tableName ? immutabilityGuard(tableName)(req, res, next) : next();
};

router.use(authMiddleware);
router.use('/:id', dynamicCertGuard);

const handleError = (res, error) => {
    console.error('Certificate API Error:', error);
    if (error.statusCode >= 400) {
        return res.status(error.statusCode).json({ success: false, error: error.message, code: error.code });
    }
    if (error.message && error.message.startsWith('409')) {
        return res.status(409).json({ success: false, error: error.message.replace('409: ', '') });
    }
    res.status(400).json({ success: false, error: error.message });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function inferType(id) {
    if (!id) return null;
    if (id.startsWith('GCR') || id.startsWith('GC-')) return 'gold';
    if (id.startsWith('SCR') || id.startsWith('SC-')) return 'silver';
    if (id.startsWith('PCR') || id.startsWith('PC-')) return 'photo';
    return null;
}

// GET /api/certificates
router.get('/', async (req, res) => {
    try {
        const { type, customer_id, status, limit, page } = req.query;
        if (!type) {
            return res.status(400).json({ error: 'Certificate type (gold, silver, photo) is required' });
        }

        const filters = {
            customer_id,
            status,
            limit : limit ? parseInt(limit)  : 20,
            offset: page  ? (parseInt(page) - 1) * (parseInt(limit) || 20) : 0,
        };

        if (type === 'photo') {
            const result = await photoCertSvc.findAll(filters);
            return res.json(result);
        }

        const result = certServiceV2.listCertificates(type, filters);
        return res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/certificates/:id
router.get('/:id', async (req, res) => {
    try {
        const { type } = req.query;
        const id = req.params.id;
        const resolvedType = type || inferType(id);
        if (!resolvedType) {
            return res.status(400).json({ error: 'Cannot infer certificate type from ID' });
        }

        let certificate;
        if (resolvedType === 'photo') {
            certificate = await photoCertSvc.findById(id);
        } else {
            certificate = certServiceV2.getCertificate(resolvedType, id);
        }

        if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
        return res.json(certificate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/certificates
router.post('/', async (req, res) => {
    try {
        let type = req.body.type || req.query.type;
        if (!type) return res.status(400).json({ error: 'Certificate type is required' });

        let certificate;
        if (type === 'photo') {
            const { customer_id, items, mode_of_payment, total, gst, gst_bill_number, total_tax, status } = req.body;
            certificate = await photoCertSvc.create(customer_id, items, { mode_of_payment, total, gst, gst_bill_number, total_tax }, status);
        } else {
            certificate = certServiceV2.createCertificate(type, req.body);
        }

        return res.status(201).json(certificate);
    } catch (error) {
        handleError(res, error);
    }
});

// POST /api/certificates/with-photo
router.post('/with-photo', upload.single('photo'), async (req, res) => {
    try {
        let data = req.body;
        if (req.body.data) {
            data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
        }

        if (req.file) {
            const photoPath = req.file.path.replace(/\\/g, '/').split('backend/')[1] || req.file.path.replace(/\\/g, '/');
            if (data.items && data.items.length > 0) {
                data.items[0].media_path = photoPath;
                data.items[0].media = photoPath;
            }
        }

        let type = data.type || req.query.type || 'gold';
        if (data.certificate_type) type = data.certificate_type.toLowerCase();

        let certificate;
        if (type === 'photo') {
            const { customer_id, items, mode_of_payment, total, gst, gst_bill_number, total_tax, status } = data;
            certificate = await photoCertSvc.create(customer_id, items, { mode_of_payment, total, gst, gst_bill_number, total_tax }, status);
        } else {
            certificate = certServiceV2.createCertificate(type, data);
        }

        return res.status(201).json(certificate);
    } catch (error) {
        handleError(res, error);
    }
});

// GET /api/certificates/:no/print
router.get('/:no/print', async (req, res) => {
    try {
        const id = req.params.no;
        const type = inferType(id);

        let certData;
        if (type === 'photo') {
            certData = await photoCertSvc.findById(id);
        } else if (type) {
            certData = certServiceV2.getCertificate(type, id);
        } else {
            return res.status(400).send('Invalid certificate ID');
        }

        if (!certData) return res.status(404).send('Certificate not found');

        const photoItem = certData.items?.find(i => i.media);
        const templateData = {
            ...certData,
            customer: { name: certData.customer_name, phone: certData.customer_phone },
            photo_path        : photoItem ? `${req.protocol}://${req.get('host')}/${photoItem.media}` : null,
            total_weight      : certData.items?.reduce((acc, i) => acc + (parseFloat(i.gross_weight) || 0), 0).toFixed(3),
            total_amount      : certData.total || 0,
            certificate_no    : certData.auto_number,
            issue_date        : certData.created_at,
            certificate_type  : type === 'photo' ? 'PHOTO' : type === 'gold' ? 'GOLD' : 'SILVER',
        };

        return res.send(generateCertificateHTML(templateData));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST /api/certificates/:id/results
router.post('/:id/results', upload.single('photo'), async (req, res) => {
    try {
        const id = req.params.id;
        let data = req.body;
        if (req.body.data) data = JSON.parse(req.body.data);

        if (req.file) {
            const photoPath = req.file.path.replace(/\\/g, '/').split('backend/')[1] || req.file.path.replace(/\\/g, '/');
            if (data.photo_item_id && data.items) {
                const item = data.items.find(i => i.id === data.photo_item_id);
                if (item) item.media = photoPath;
            } else if (data.items && data.items.length > 0) {
                data.items[0].media = photoPath;
            }
        }

        const type = data.type || inferType(id);

        if (type === 'photo') {
            await photoCertSvc.saveResults(id, data);
        } else {
            await certServiceV2.saveResults(type, id, data);
        }

        return res.json({ success: true });
    } catch (error) {
        handleError(res, error);
    }
});

// PATCH /api/certificates/:id/status
router.patch('/:id/status', async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;

        let workflowType;
        if (id.startsWith('PCR'))      workflowType = 'photo_cert';
        else if (id.startsWith('GCR')) workflowType = 'gold_cert';
        else if (id.startsWith('SCR')) workflowType = 'silver_cert';
        else return res.status(400).json({ success: false, error: 'Cannot infer certificate type from ID' });

        await workflowService.updateStatus(workflowType, id, status);
        return res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
