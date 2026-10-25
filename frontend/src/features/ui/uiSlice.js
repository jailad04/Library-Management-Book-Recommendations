import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('booknest_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const initialState = {
  theme: getInitialTheme(),
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  globalSearchQuery: '',
  toasts: []
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('booknest_theme', state.theme);
        document.documentElement.setAttribute('data-theme', state.theme);
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('booknest_theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    closeMobileSidebar: (state) => {
      state.mobileSidebarOpen = false;
    },
    setGlobalSearchQuery: (state, action) => {
      state.globalSearchQuery = action.payload;
    },
    addToast: (state, action) => {
      const id = Date.now().toString();
      state.toasts.push({
        id,
        type: action.payload.type || 'info', // 'info', 'success', 'warning', 'danger'
        message: action.payload.message,
        duration: action.payload.duration || 4000
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    }
  }
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  closeMobileSidebar,
  setGlobalSearchQuery,
  addToast,
  removeToast
} = uiSlice.actions;

export default uiSlice.reducer;
