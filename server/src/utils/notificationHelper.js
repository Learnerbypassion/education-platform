const Notification = require('../models/Notification');

/**
 * Creates a user notification in a non-blocking/fail-safe way.
 * 
 * @param {string} userId - Target User ID
 * @param {string} type - 'registration', 'enrollment', 'assignment-deadline', 'exam-schedule', 'certificate-issued', 'course-update', 'submission-graded', 'general'
 * @param {string} title - Short title
 * @param {string} message - Full text
 * @param {string} link - Optional frontend link redirect
 * @param {object} metadata - Optional additional data
 */
const createNotification = async (userId, type, title, message, link = '', metadata = {}) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata
    });
    console.log(`🔔 Notification of type "${type}" created for user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to create notification: ${error.message}`);
  }
};

module.exports = { createNotification };
