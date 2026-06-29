const express = require('express');
const router = express.Router();
const { generateCertificate, getMyCertificates, getCertificate, verifyCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

// Public verification
router.get('/verify/:certificateId', verifyCertificate);

// Private
router.post('/generate', protect, generateCertificate);
router.get('/me', protect, getMyCertificates);
router.get('/:id', protect, getCertificate);

module.exports = router;
