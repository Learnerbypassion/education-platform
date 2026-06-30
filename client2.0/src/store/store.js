import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import examReducer from './slices/examSlice';
import assignmentReducer from './slices/assignmentSlice';
import certificateReducer from './slices/certificateSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    exams: examReducer,
    assignments: assignmentReducer,
    certificates: certificateReducer,
    ui: uiReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
