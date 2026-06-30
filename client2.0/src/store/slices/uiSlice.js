import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    modalOpen: false,
    modalContent: null,
    searchQuery: '',
  },
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen(state, action) { state.sidebarOpen = action.payload; },
    openModal(state, action) { state.modalOpen = true; state.modalContent = action.payload; },
    closeModal(state) { state.modalOpen = false; state.modalContent = null; },
    setSearchQuery(state, action) { state.searchQuery = action.payload; },
  },
});

export const { toggleSidebar, setSidebarOpen, openModal, closeModal, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;
