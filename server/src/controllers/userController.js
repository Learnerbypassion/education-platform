const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, 'User profile', user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, githubUsername, socialLinks } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (githubUsername !== undefined) updateData.githubUsername = githubUsername;
  if (socialLinks) updateData.socialLinks = socialLinks;

  // Handle profile image upload
  if (req.file) {
    updateData.profileImage = `/uploads/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  ApiResponse.success(res, 'Profile updated', user);
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const role = req.query.role;

  const query = {};
  if (role) query.role = role;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  ApiResponse.paginated(res, 'Users fetched', users, {
    page, limit, total, pages: Math.ceil(total / limit),
  });
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  await User.findByIdAndDelete(req.params.id);
  ApiResponse.success(res, 'User deleted');
});

module.exports = { getUserProfile, updateProfile, getAllUsers, deleteUser };
