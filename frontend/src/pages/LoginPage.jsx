import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { loginSuccess, setAuthLoading, setAuthError, clearAuthError } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import authApi from '../services/authApi';
import Button from '../components/common/Button';
import './LoginPage.css';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authError = useSelector((state) => state.auth.error);
  const authLoading = useSelector((state) => state.auth.loading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    if (!validate()) return;

    dispatch(setAuthLoading(true));
    try {
      const data = await authApi.login({ email: email.trim(), password });
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      dispatch(addToast({ type: 'success', message: `Welcome back, ${data.user.name}!` }));
      navigate('/');
    } catch (err) {
      dispatch(setAuthError(err.message));
    }
  };

  const handleDemoFill = (role = 'user') => {
    dispatch(clearAuthError());
    setErrors({});
    if (role === 'admin') {
      setEmail('admin@university.edu');
      setPassword('admin1234');
    } else {
      setEmail('alex.morgan@university.edu');
      setPassword('student1234');
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">
          Sign in to your BookNest account to manage borrowings and discover personalized recommendations.
        </p>
      </div>

      {authError && (
        <div className="login-error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{authError}</span>
        </div>
      )}

      {/* Quick Demo Credentials for evaluators */}
      <div className="demo-fill-card">
        <div className="demo-fill-label">
          <Sparkles size={14} color="var(--color-amber)" />
          <span>Demo Quick Login</span>
        </div>
        <div className="demo-fill-actions">
          <button
            type="button"
            className="demo-pill-btn"
            onClick={() => handleDemoFill('user')}
          >
            Fill Student
          </button>
          <button
            type="button"
            className="demo-pill-btn"
            onClick={() => handleDemoFill('admin')}
          >
            Fill Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <div className="form-group">
          <label htmlFor="login-email" className="form-label">
            University Email
          </label>
          <div className="input-wrapper">
            <Mail size={18} className="input-icon" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="e.g. alex.morgan@university.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
          </div>
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <div className="label-with-aside">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <span className="form-hint-link">Forgot password?</span>
          </div>
          <div className="input-wrapper">
            <Lock size={18} className="input-icon" />
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={authLoading}
          icon={LogIn}
          className="login-submit-btn"
        >
          Sign In to Library
        </Button>
      </form>

      <div className="login-footer">
        <span>Don't have a library account yet?</span>{' '}
        <Link to="/register" className="auth-switch-link">
          Register here
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
