const express = require('express');
const router = express.Router();
const { createLesson, getLessons, updateLesson, deleteLesson, updateProgress } = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createLessonSchema } = require('../validators/courseValidator');
const { uploadMultiple } = require('../middleware/upload');
const { checkCourseOwnership } = require('../middleware/ownership');

router.get('/:moduleId', protect, getLessons);
router.post('/:moduleId', protect, authorize('instructor', 'admin'), checkCourseOwnership('module', 'params'), uploadMultiple('attachments', 5), createLesson);
router.put('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('lesson', 'params'), updateLesson);
router.delete('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('lesson', 'params'), deleteLesson);
router.post('/:id/progress', protect, updateProgress);

module.exports = router;
