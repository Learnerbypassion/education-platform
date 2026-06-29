import API from './axios';

export const getExams = (courseId) => API.get(`/exams/course/${courseId}`);
export const getExam = (id) => API.get(`/exams/${id}`);
export const createExam = (data) => API.post('/exams', data);
export const updateExam = (id, data) => API.put(`/exams/${id}`, data);
export const deleteExam = (id) => API.delete(`/exams/${id}`);
export const takeExam = (id) => API.get(`/exams/${id}/take`);
export const submitExam = (id, data) => API.post(`/exams/${id}/submit`, data);
export const getExamResults = (id) => API.get(`/exams/${id}/results`);
export const addQuestion = (id, data) => API.post(`/exams/${id}/questions`, data);
