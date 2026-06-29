import { createSlice } from '@reduxjs/toolkit';

const examSlice = createSlice({
  name: 'exams',
  initialState: {
    list: [],
    current: null,
    questions: [],
    submission: null,
    loading: false,
    error: null,
  },
  reducers: {
    setExams(state, action) { state.list = action.payload; },
    setCurrentExam(state, action) { state.current = action.payload; },
    setQuestions(state, action) { state.questions = action.payload; },
    setSubmission(state, action) { state.submission = action.payload; },
    setLoading(state, action) { state.loading = action.payload; },
    setError(state, action) { state.error = action.payload; },
    clearExam(state) { state.current = null; state.questions = []; state.submission = null; },
  },
});

export const { setExams, setCurrentExam, setQuestions, setSubmission, setLoading, setError, clearExam } = examSlice.actions;
export default examSlice.reducer;
