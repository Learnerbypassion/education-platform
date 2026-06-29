const express = require('express');
const router = express.Router();
const { createLesson, getLessons, updateLesson, deleteLesson, updateProgress } = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createLessonSchema } = require('../validators/courseValidator');
const { uploadMultiple } = require('../middleware/upload');

router.get('/:moduleId', getLessons);
router.post('/:moduleId', protect, authorize('instructor', 'admin'), uploadMultiple('attachments', 5), createLesson);
router.put('/:id', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteLesson);
router.post('/:id/progress', protect, updateProgress);

module.exports = router;
