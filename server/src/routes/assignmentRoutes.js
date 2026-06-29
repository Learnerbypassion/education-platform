const express = require('express');
const router = express.Router();
const {
  createAssignment, getAssignments, getAssignment,
  updateAssignment, deleteAssignment, submitAssignment, getSubmissions,
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createAssignmentSchema } = require('../validators/assignmentValidator');
const { uploadMultiple } = require('../middleware/upload');

router.post('/', protect, authorize('instructor', 'admin'), validate(createAssignmentSchema), createAssignment);
router.get('/course/:courseId', protect, getAssignments);
router.get('/:id', protect, getAssignment);
router.put('/:id', protect, authorize('instructor', 'admin'), updateAssignment);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteAssignment);
router.post('/:id/submit', protect, uploadMultiple('files', 5), submitAssignment);
router.get('/:id/submissions', protect, authorize('instructor', 'admin'), getSubmissions);

module.exports = router;
