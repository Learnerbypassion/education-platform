import API from './axios';

export const generateCertificate = (courseId) => API.post('/certificates/generate', { courseId });
export const getMyCertificates = () => API.get('/certificates/me');
export const getCertificate = (id) => API.get(`/certificates/${id}`);
export const verifyCertificate = (certificateId) => API.get(`/certificates/verify/${certificateId}`);
