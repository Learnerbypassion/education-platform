const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, getAllUsers, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/authValidator');
const { uploadSingle } = require('../middleware/upload');

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', getUserProfile);
router.put('/profile', protect, uploadSingle('profileImage'), validate(updateProfileSchema), updateProfile);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
