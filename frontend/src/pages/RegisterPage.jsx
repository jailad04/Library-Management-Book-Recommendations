import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { User, Mail, Lock, Building, IdCard, UserPlus, Check } from 'lucide-react';
import { loginSuccess, setAuthLoading, setAuthError } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import authApi from '../services/authApi';
import Button from '../components/common/Button';
import './RegisterPage.css';

const AVAILABLE_GENRES = [
  'Computer Science',
  'Artificial Intelligence',
  'Data Science',
  'Software Architecture',
  'Sci-Fi',
  'Psychology',
  'Philosophy',
  'History'
];

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    memberId: '',
    department: 'Computer Science & Engineering',
    password: '',
    confirmPassword: '',
    preferredGenres: ['Computer Science', 'Artificial Intelligence']
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const toggleGenre = (genre) => {
    setFormData((prev) => {
      const exists = prev.preferredGenres.includes(genre);
      return {
        ...prev,
        preferredGenres: exists
          ? prev.preferredGenres.filter((g) => g !== genre)
          : [...prev.preferredGenres, genre]
      };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'University email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.memberId.trim()) errs.memberId = 'Student/Staff ID is required';
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (formData.preferredGenres.length === 0) {
      errs.genres = 'Select at least one reading interest';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    dispatch(setAuthError(null));
    try {
      const data = await authApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        memberId: formData.memberId.trim(),
        department: formData.department,
        preferredGenres: formData.preferredGenres
      });
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      dispatch(addToast({
        type: 'success',
        message: `Account created! Welcome to BookNest, ${data.user.name}.`
      }));
      navigate('/');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <h1 className="register-title">Join BookNest</h1>
        <p className="register-subtitle">
          Register your university library account to start borrowing books and receiving AI recommendations.
        </p>
      </div>

      {errors.submit && (
        <div className="login-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form" noValidate>
        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">
              Full Name
            </label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="reg-name"
                type="text"
                placeholder="Alex Morgan"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                className={`input-field ${errors.name ? 'input-error' : ''}`}
              />
            </div>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-id" className="form-label">
              Student / Staff ID
            </label>
            <div className="input-wrapper">
              <IdCard size={18} className="input-icon" />
              <input
                id="reg-id"
                type="text"
                placeholder="BN-2026-8842"
                value={formData.memberId}
                onChange={(e) => {
                  setFormData({ ...formData, memberId: e.target.value });
                  if (errors.memberId) setErrors((prev) => ({ ...prev, memberId: null }));
                }}
                className={`input-field ${errors.memberId ? 'input-error' : ''}`}
              />
            </div>
            {errors.memberId && <span className="error-message">{errors.memberId}</span>}
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              University Email
            </label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                type="email"
                placeholder="alex.morgan@university.edu"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                className={`input-field ${errors.email ? 'input-error' : ''}`}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-dept" className="form-label">
              Department
            </label>
            <div className="input-wrapper">
              <Building size={18} className="input-icon" />
              <select
                id="reg-dept"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input-field select-field"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="reg-pw" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-pw"
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                className={`input-field ${errors.password ? 'input-error' : ''}`}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="reg-cpw" className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-cpw"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: null }));
                }}
                className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
              />
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        {/* Reading Interests for AI Recommendations */}
        <div className="form-group">
          <label className="form-label">
            Reading Interests & Topics <span style={{ color: 'var(--text-muted)' }}>(Used for AI Recommendations)</span>
          </label>
          <div className="genre-pill-selector">
            {AVAILABLE_GENRES.map((genre) => {
              const selected = formData.preferredGenres.includes(genre);
              return (
                <button
                  type="button"
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`genre-choice-pill ${selected ? 'selected' : ''}`}
                >
                  {selected && <Check size={13} strokeWidth={2.5} />}
                  <span>{genre}</span>
                </button>
              );
            })}
          </div>
          {errors.genres && <span className="error-message">{errors.genres}</span>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          icon={UserPlus}
          className="register-submit-btn"
        >
          Create Library Account
        </Button>
      </form>

      <div className="register-footer">
        <span>Already have an account?</span>{' '}
        <Link to="/login" className="auth-switch-link">
          Sign in here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
