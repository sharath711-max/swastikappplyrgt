const express = require('express');
const router = express.Router();
const certificateService = require('../services/certificateService');
const upload = require('../middleware/uploadMiddleware');
const { generateCertificateHTML } = require('../utils/certificateTemplate');
const { authMiddleware } = require('../middleware/authMiddleware');
const { immutabilityGuard } = require('../middleware/immutabilityGuard');

// We have 3 distinct tableNames to guard based on ID prefixes. We will create a dynamic guard for certificates:
const dynamicCertGuard = (req, res, next) => {
    let tableName = null;
    const id = req.params.id || req.body.id;
    if (id) {
        if (id.startsWith('GCR') || id.startsWith('GC-')) tableName = 'gold_certificate';
        else if (id.startsWith('SCR') || id.startsWith('SC-')) tableName = 'silver_certificate';
        else if (id.startsWith('PCR') || id.startsWith('PC-')) tableName = 'photo_certificate';
    }

    if (tableName) {
        return immutabilityGuard(tableName)(req, res, next);
    }
    next();
};

router.use(authMiddleware);
router.use('/:id', dynamicCertGuard);

const handleError = (res, error) => {
    console.error('Certificate API Error:', error);
    if (error.message.startsWith('409')) {
        return res.status(409).json({ success: false, error: error.message.replace('409: ', '') });
    }
    res.status(400).json({ success: false, error: error.message });
};

// GET /api/certificates
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { type, customer_id, status, limit, page } = req.query;
        if (!type) {
            return res.status(400).json({ error: 'Certificate type (gold, silver, photo) is required' });
        }

        const filters = {
            customer_id,
            status,
            limit: limit ? parseInt(limit) : 20,
            offset: page ? (parseInt(page) - 1) * (parseInt(limit) || 20) : 0
        };

        const result = await certificateService.listCertificates(type, filters);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/certificates/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { type } = req.query;
        const id = req.params.id;
        let inferredType = type;

        if (!inferredType) {
            if (id.startsWith('GCR') || id.startsWith('GC-')) inferredType = 'gold';
            else if (id.startsWith('SCR') || id.startsWith('SC-')) inferredType = 'silver';
            else if (id.startsWith('PCR') || id.startsWith('PC-')) inferredType = 'photo';
            else return res.status(400).json({ error: 'Cannot infer certificate type from ID' });
        }

        const certificate = await certificateService.getCertificate(inferredType, id);
        if (!certificate) return res.status(404).json({ error: 'Certificate not found' });
        res.json(certificate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/certificates
router.post('/', authMiddleware, async (req, res) => {
    try {
        const certificate = await certificateService.generateCertificate(req.body);
        res.status(201).json(certificate);
    } catch (error) {
        handleError(res, error);
    }
});

// POST /api/certificates/with-photo
router.post('/with-photo', authMiddleware, upload.single('photo'), async (req, res) => {
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

        const certificate = await certificateService.generateCertificate(data);
        res.status(201).json(certificate);
    } catch (error) {
        handleError(res, error);
    }
});

// GET /api/certificates/:no/print
router.get('/:no/print', async (req, res) => {
    try {
        const certData = await certificateService.getCertificateByNo(req.params.no);
        if (!certData) return res.status(404).send('Certificate not found');

        // Transform for template
        const photoItem = certData.items?.find(i => i.media);
        const templateData = {
            ...certData,
            customer: {
                name: certData.customer_name,
                phone: certData.customer_phone
            },
            photo_path: photoItem ? `${req.protocol}://${req.get('host')}/${photoItem.media}` : null,
            total_weight: certData.items?.reduce((acc, i) => acc + (parseFloat(i.gross_weight) || 0), 0).toFixed(3),
            total_amount: certData.total || 0,
            certificate_no: certData.auto_number,
            issue_date: certData.created_at,
            certificate_type: certData.id.startsWith('PCR') ? 'PHOTO' : certData.id.startsWith('GCR') ? 'GOLD' : 'SILVER'
        };

        const html = generateCertificateHTML(templateData);
        res.send(html);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// POST /api/certificates/:id/results (Handles photo uploads and result saves)
router.post('/:id/results', authMiddleware, upload.single('photo'), async (req, res) => {
    try {
        const id = req.params.id;
        let data = req.body;

        if (req.body.data) {
            data = JSON.parse(req.body.data);
        }

        if (req.file) {
            // Normalize path for web storage
            const photoPath = req.file.path.replace(/\\/g, '/').split('backend/')[1] || req.file.path.replace(/\\/g, '/');

            if (data.photo_item_id && data.items) {
                const item = data.items.find(i => i.id === data.photo_item_id);
                if (item) item.media = photoPath;
            } else if (data.items && data.items.length > 0) {
                data.items[0].media = photoPath;
            }
        }

        let type = data.type;
        if (!type) {
            if (id.startsWith('PCR')) type = 'photo';
            else if (id.startsWith('GCR')) type = 'gold';
            else if (id.startsWith('SCR')) type = 'silver';
        }

        await certificateService.saveResults(type, id, data);
        res.json({ success: true });
    } catch (error) {
        handleError(res, error);
    }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        let type;
        if (id.startsWith('PCR')) type = 'photo';
        else if (id.startsWith('GCR')) type = 'gold';
        else if (id.startsWith('SCR')) type = 'silver';

        await certificateService.updateStatus(type, id, status);
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
