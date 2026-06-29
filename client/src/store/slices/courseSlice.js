import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as courseApi from '../../api/courseApi';

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await courseApi.getCourses(params);
    return { courses: res.data.data, pagination: res.data.pagination };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch courses');
  }
});

export const fetchCourseById = createAsyncThunk('courses/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await courseApi.getCourseById(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Course not found');
  }
});

export const fetchEnrolledCourses = createAsyncThunk('courses/fetchEnrolled', async (_, { rejectWithValue }) => {
  try {
    const res = await courseApi.getEnrolledCourses();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchInstructorCourses = createAsyncThunk('courses/fetchInstructor', async (_, { rejectWithValue }) => {
  try {
    const res = await courseApi.getInstructorCourses();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    list: [],
    current: null,
    enrolled: [],
    instructorCourses: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => { state.loading = true; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.courses;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCourseById.pending, (state) => { state.loading = true; })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.enrolled = action.payload;
      })
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.instructorCourses = action.payload;
      });
  },
});

export const { clearCurrent, clearError } = courseSlice.actions;
export default courseSlice.reducer;
