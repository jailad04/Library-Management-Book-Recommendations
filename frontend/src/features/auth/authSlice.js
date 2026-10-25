import { createSlice } from '@reduxjs/toolkit';

// Restore session from localStorage if a token exists
const savedToken = localStorage.getItem('booknest_token');
let savedUser = null;
try {
  const raw = localStorage.getItem('booknest_user');
  if (raw) savedUser = JSON.parse(raw);
} catch {
  // ignore corrupt data
}

const initialState = {
  user: savedUser,
  isAuthenticated: !!(savedToken && savedUser),
  token: savedToken,
  loading: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      state.loading = false;
      // Persist to localStorage for page-refresh survival
      localStorage.setItem('booknest_token', action.payload.token);
      localStorage.setItem('booknest_user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('booknest_token');
      localStorage.removeItem('booknest_user');
    },
    switchRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload; // 'user' or 'admin'
        // Sync to localStorage so it survives a refresh
        localStorage.setItem('booknest_user', JSON.stringify(state.user));
      }
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('booknest_user', JSON.stringify(state.user));
      }
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  }
});

export const {
  loginSuccess,
  logout,
  switchRole,
  updateProfile,
  setAuthLoading,
  setAuthError,
  clearAuthError
} = authSlice.actions;

export default authSlice.reducer;
