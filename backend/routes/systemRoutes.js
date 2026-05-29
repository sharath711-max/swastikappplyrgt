'use strict';

const express = require('express');
const router  = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { isParity, isStrict, SYSTEM_MODE, getBypassSummary } = require('../config/systemMode');

router.use(authMiddleware);

// GET /api/system/mode
//
// Operationally important and cheap. Every authenticated role can read
// this — parity-mode visibility is institutional, not admin-only. The
// front-end uses this to render the persistent top banner so operators
// always know when integrity guards are relaxed.
//
// Bypass summary intentionally omitted from the public payload (it's
// admin telemetry — see GET /api/analytics/parity-bypasses for that).
// Front-end banner only needs to know whether parity is on.
router.get('/mode', (req, res) => {
    res.json({
        success: true,
        data: {
            system_mode: SYSTEM_MODE,
            is_parity : isParity(),
            is_strict : isStrict(),
        },
    });
});

module.exports = router;
