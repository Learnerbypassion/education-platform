const express = require('express');
const router = express.Router();
const {
  createExam, getExams, getExam, takeExam,
  submitExam, getExamResults, updateExam, deleteExam, addQuestion,
} = require('../controllers/examController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createExamSchema, submitExamSchema, createQuestionSchema } = require('../validators/examValidator');
const { checkCourseOwnership } = require('../middleware/ownership');

router.post('/', protect, authorize('instructor', 'admin'), checkCourseOwnership('course', 'body'), validate(createExamSchema), createExam);
router.get('/course/:courseId', protect, getExams);
router.get('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('exam', 'params'), getExam);
router.get('/:id/take', protect, takeExam);
router.post('/:id/submit', protect, validate(submitExamSchema), submitExam);
router.get('/:id/results', protect, getExamResults);
router.put('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('exam', 'params'), updateExam);
router.delete('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('exam', 'params'), deleteExam);
router.post('/:id/questions', protect, authorize('instructor', 'admin'), checkCourseOwnership('exam', 'params'), validate(createQuestionSchema), addQuestion);

module.exports = router;
