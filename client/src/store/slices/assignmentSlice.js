import { createSlice } from '@reduxjs/toolkit';

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    list: [],
    current: null,
    submissions: [],
    loading: false,
    error: null,
  },
  reducers: {
    setAssignments(state, action) { state.list = action.payload; },
    setCurrentAssignment(state, action) { state.current = action.payload; },
    setSubmissions(state, action) { state.submissions = action.payload; },
    setLoading(state, action) { state.loading = action.payload; },
    setError(state, action) { state.error = action.payload; },
    clearAssignment(state) { state.current = null; state.submissions = []; },
  },
});

export const { setAssignments, setCurrentAssignment, setSubmissions, setLoading, setError, clearAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;
