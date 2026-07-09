const express = require('express');
const router = express.Router();
const {
  createExam, getExams, getExam, takeExam,
  submitExam, getExamResults, updateExam, deleteExam, addQuestion,
  requestAttempt, getInstructorAttemptRequests, updateAttemptRequestStatus,
} = require('../controllers/examController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createExamSchema, submitExamSchema, createQuestionSchema } = require('../validators/examValidator');
const { checkCourseOwnership } = require('../middleware/ownership');

// Instructors & Admins
router.post('/', protect, authorize('instructor', 'admin'), checkCourseOwnership('course', 'body'), validate(createExamSchema), createExam);
router.get('/instructor/attempt-requests', protect, authorize('instructor', 'admin'), getInstructorAttemptRequests);
router.patch('/attempt-requests/:requestId', protect, authorize('instructor', 'admin'), updateAttemptRequestStatus);

// Students
router.post('/:id/request-attempt', protect, authorize('student'), requestAttempt);
router.get('/:id/take', protect, authorize('student'), takeExam);
router.post('/:id/submit', protect, authorize('student'), validate(submitExamSchema), submitExam);
router.get('/:id/results', protect, authorize('student'), getExamResults);

// General & Shared
router.get('/course/:courseId', protect, getExams);
router.get('/:id', protect, getExam);
router.put('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('exam', 'params'), updateExam);
router.delete('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('exam', 'params'), deleteExam);
router.post('/:id/questions', protect, authorize('instructor', 'admin'), checkCourseOwnership('exam', 'params'), validate(createQuestionSchema), addQuestion);

module.exports = router;
