import { createSlice } from '@reduxjs/toolkit';

const certificateSlice = createSlice({
  name: 'certificates',
  initialState: {
    list: [],
    current: null,
    verification: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCertificates(state, action) { state.list = action.payload; },
    setCurrentCertificate(state, action) { state.current = action.payload; },
    setVerification(state, action) { state.verification = action.payload; },
    setLoading(state, action) { state.loading = action.payload; },
    setError(state, action) { state.error = action.payload; },
  },
});

export const { setCertificates, setCurrentCertificate, setVerification, setLoading, setError } = certificateSlice.actions;
export default certificateSlice.reducer;
