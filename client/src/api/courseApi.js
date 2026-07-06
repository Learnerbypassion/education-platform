import API from './axios';

export const getCourses = (params) => API.get('/courses', { params });
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => {
  const config = data instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  return API.post('/courses', data, config);
};
export const updateCourse = (id, data) => {
  const config = data instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  return API.put(`/courses/${id}`, data, config);
};
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const togglePublish = (id) => API.patch(`/courses/${id}/publish`);
export const enrollCourse = (id) => API.post(`/courses/${id}/enroll`);
export const getInstructorCourses = () => API.get('/courses/instructor/me');
export const getEnrolledCourses = () => API.get('/courses/enrolled/me');
export const searchCourses = (params) => API.get('/search/courses', { params });

// Modules
export const getModules = (courseId) => API.get(`/modules/${courseId}`);
export const createModule = (courseId, data) => API.post(`/modules/${courseId}`, data);
export const updateModule = (id, data) => API.put(`/modules/${id}`, data);
export const deleteModule = (id) => API.delete(`/modules/${id}`);

// Lessons
export const getLessons = (moduleId) => API.get(`/lessons/${moduleId}`);
export const createLesson = (moduleId, data) => {
  const config = data instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  return API.post(`/lessons/${moduleId}`, data, config);
};
export const updateLesson = (id, data) => API.put(`/lessons/${id}`, data);
export const deleteLesson = (id) => API.delete(`/lessons/${id}`);
export const updateProgress = (id, data) => API.post(`/lessons/${id}/progress`, data);
export const getMySubmissions = () => API.get('/submissions/me');
