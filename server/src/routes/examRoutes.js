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

router.post('/', protect, authorize('instructor', 'admin'), createExam);
router.get('/course/:courseId', protect, getExams);
router.get('/:id', protect, authorize('instructor', 'admin'), getExam);
router.get('/:id/take', protect, takeExam);
router.post('/:id/submit', protect, validate(submitExamSchema), submitExam);
router.get('/:id/results', protect, getExamResults);
router.put('/:id', protect, authorize('instructor', 'admin'), updateExam);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteExam);
router.post('/:id/questions', protect, authorize('instructor', 'admin'), validate(createQuestionSchema), addQuestion);

module.exports = router;
