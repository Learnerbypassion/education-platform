import API from './axios';

export const generateCourseDescription = (title, category) => {
  return API.post('/ai/course-description', { title, category });
};

export const generateLessonSummary = (title, content) => {
  return API.post('/ai/lesson-summary', { title, content });
};

export const generateCustomPrompt = (prompt) => {
  return API.post('/ai/custom', { prompt });
};
