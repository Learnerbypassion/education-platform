import API from './axios';

export const getAssignments = (courseId) => API.get(`/assignments/course/${courseId}`);
export const getAssignment = (id) => API.get(`/assignments/${id}`);
export const createAssignment = (data) => API.post('/assignments', data);
export const updateAssignment = (id, data) => API.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => API.delete(`/assignments/${id}`);
export const submitAssignment = (id, data) => {
  const config = data instanceof FormData
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
  return API.post(`/assignments/${id}/submit`, data, config);
};
export const getSubmissions = (id) => API.get(`/assignments/${id}/submissions`);
