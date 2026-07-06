const express = require('express');
const { getReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('student'), addReview);

module.exports = router;
