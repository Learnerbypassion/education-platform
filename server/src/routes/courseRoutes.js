const express = require('express');
const router = express.Router();
const {
  createCourse, getCourses, getCourseById, updateCourse,
  deleteCourse, togglePublish, enrollCourse, getInstructorCourses, getEnrolledCourses,
} = require('../controllers/courseController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createCourseSchema, updateCourseSchema } = require('../validators/courseValidator');
const { uploadSingle } = require('../middleware/upload');
const reviewRouter = require('./reviewRoutes');

// Re-route into other resource routers
router.use('/:courseId/reviews', reviewRouter);

// Public / Optional Auth
router.get('/', getCourses);

// Instructor
router.post('/', protect, authorize('instructor', 'admin'), uploadSingle('thumbnail'), validate(createCourseSchema), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), uploadSingle('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.patch('/:id/publish', protect, authorize('instructor', 'admin'), togglePublish);
router.get('/instructor/me', protect, authorize('instructor', 'admin'), getInstructorCourses);

// Student
router.post('/:id/enroll', protect, enrollCourse);
router.get('/enrolled/me', protect, getEnrolledCourses);

// Get by ID (placed at the bottom to avoid overriding static sub-routes like enrolled/me)
router.get('/:id', optionalAuth, getCourseById);

module.exports = router;
