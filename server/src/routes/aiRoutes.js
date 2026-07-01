const express = require('express');
const router = express.Router();
const { generateCourseDescription, generateLessonSummary, generateCustomPrompt } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);
router.use(authorize('instructor', 'admin'));

router.post('/course-description', generateCourseDescription);
router.post('/lesson-summary', generateLessonSummary);
router.post('/custom', generateCustomPrompt);

module.exports = router;
