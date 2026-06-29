const express = require('express');
const router = express.Router();
const {
  createCourse, getCourses, getCourseById, updateCourse,
  deleteCourse, togglePublish, enrollCourse, getInstructorCourses, getEnrolledCourses,
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createCourseSchema, updateCourseSchema } = require('../validators/courseValidator');
const { uploadSingle } = require('../middleware/upload');

// Public
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Instructor
router.post('/', protect, authorize('instructor', 'admin'), validate(createCourseSchema), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), uploadSingle('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.patch('/:id/publish', protect, authorize('instructor', 'admin'), togglePublish);
router.get('/instructor/me', protect, authorize('instructor', 'admin'), getInstructorCourses);

// Student
router.post('/:id/enroll', protect, enrollCourse);
router.get('/enrolled/me', protect, getEnrolledCourses);

module.exports = router;
