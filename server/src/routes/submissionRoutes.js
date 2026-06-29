const express = require('express');
const router = express.Router();
const { getMySubmissions, getSubmission } = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMySubmissions);
router.get('/:id', protect, getSubmission);

module.exports = router;
