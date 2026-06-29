const express = require('express');
const router = express.Router();
const { getStudentStats, getInstructorStats, getAdminStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/student', protect, getStudentStats);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorStats);
router.get('/admin', protect, authorize('admin'), getAdminStats);

module.exports = router;
