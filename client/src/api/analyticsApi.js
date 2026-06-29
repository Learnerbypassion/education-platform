import API from './axios';

export const getStudentStats = () => API.get('/analytics/student');
export const getInstructorStats = () => API.get('/analytics/instructor');
export const getAdminStats = () => API.get('/analytics/admin');
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
