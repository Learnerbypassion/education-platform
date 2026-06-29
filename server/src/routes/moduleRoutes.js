const express = require('express');
const router = express.Router();
const { createModule, getModules, updateModule, deleteModule } = require('../controllers/moduleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createModuleSchema } = require('../validators/courseValidator');

router.get('/:courseId', getModules);
router.post('/:courseId', protect, authorize('instructor', 'admin'), validate(createModuleSchema), createModule);
router.put('/:id', protect, authorize('instructor', 'admin'), updateModule);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteModule);

module.exports = router;
