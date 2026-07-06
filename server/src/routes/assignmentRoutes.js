const express = require('express');
const router = express.Router();
const {
  createAssignment, getAssignments, getAssignment,
  updateAssignment, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createAssignmentSchema } = require('../validators/assignmentValidator');
const { uploadMultiple } = require('../middleware/upload');
const { checkCourseOwnership } = require('../middleware/ownership');

router.post('/', protect, authorize('instructor', 'admin'), checkCourseOwnership('course', 'body'), validate(createAssignmentSchema), createAssignment);
router.get('/course/:courseId', protect, getAssignments);
router.get('/:id', protect, getAssignment);
router.put('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('assignment', 'params'), updateAssignment);
router.delete('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('assignment', 'params'), deleteAssignment);
router.post('/:id/submit', protect, uploadMultiple('files', 5), submitAssignment);
router.get('/:id/submissions', protect, authorize('instructor', 'admin'), checkCourseOwnership('assignment', 'params'), getSubmissions);
router.put('/:id/submissions/:submissionId/grade', protect, authorize('instructor', 'admin'), checkCourseOwnership('assignment', 'params'), gradeSubmission);

module.exports = router;
