const express = require('express');
const router = express.Router();
const { createModule, getModules, updateModule, deleteModule } = require('../controllers/moduleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createModuleSchema } = require('../validators/courseValidator');
const { checkCourseOwnership } = require('../middleware/ownership');

router.get('/:courseId', getModules);
router.post('/:courseId', protect, authorize('instructor', 'admin'), checkCourseOwnership('course', 'params'), validate(createModuleSchema), createModule);
router.put('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('module', 'params'), updateModule);
router.delete('/:id', protect, authorize('instructor', 'admin'), checkCourseOwnership('module', 'params'), deleteModule);

module.exports = router;
