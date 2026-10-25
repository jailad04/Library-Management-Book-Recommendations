import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Mail,
  Building,
  Target,
  Check,
  Save,
  Shield
} from 'lucide-react';
import { updateProfile } from '../features/auth/authSlice';
import { addToast } from '../features/ui/uiSlice';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './ProfilePage.css';

const ALL_GENRES = [
  'Computer Science',
  'Artificial Intelligence',
  'Data Science',
  'Software Architecture',
  'Sci-Fi',
  'Psychology',
  'Philosophy',
  'History'
];

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const borrowings = useSelector((state) => state.borrowings.items);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || 'Computer Science & Engineering',
    readingGoalTarget: user?.readingGoal?.target || 20,
    preferredGenres: user?.preferredGenres || []
  });

  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      dispatch(
        updateProfile({
          name: formData.name,
          email: formData.email,
          department: formData.department,
          preferredGenres: formData.preferredGenres,
          readingGoal: {
            ...user.readingGoal,
            target: Number(formData.readingGoalTarget)
          }
        })
      );
      dispatch(
        addToast({
          type: 'success',
          message: 'Profile settings updated successfully.'
        })
      );
    }, 500);
  };

  const completedBooks = borrowings.filter((b) => b.status === 'returned').length;
  const goalTarget = Number(formData.readingGoalTarget) || 20;
  const progressPercent = Math.min(100, Math.round((completedBooks / goalTarget) * 100));

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            className="profile-large-avatar"
          />
          <div className="profile-hero-details">
            <div className="profile-name-row">
              <h1 className="profile-name">{user?.name}</h1>
              <Badge variant={user?.role === 'admin' ? 'purple' : 'success'} icon={Shield}>
                {user?.role === 'admin' ? 'Library Staff / Admin' : 'Active Student Member'}
              </Badge>
            </div>
            <p className="profile-meta-text">
              <span>{user?.department}</span>
              <span>•</span>
              <span>Member ID: {user?.memberId}</span>
              <span>•</span>
              <span>Joined {user?.joinDate}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="profile-columns-layout">
        {/* Left Form: Edit Information */}
        <div className="profile-card profile-form-container">
          <h2 className="profile-card-title">Edit Profile Information</h2>
          <p className="profile-card-desc">
            Update your personal details, academic affiliation, and preferences.
          </p>

          <form onSubmit={handleSave} className="profile-form">
            <div className="form-group">
              <label htmlFor="prof-name" className="form-label">
                Full Name
              </label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="prof-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prof-email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="prof-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prof-dept" className="form-label">
                Department
              </label>
              <div className="input-wrapper">
                <Building size={18} className="input-icon" />
                <select
                  id="prof-dept"
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

            {/* Reading Goal Target */}
            <div className="form-group">
              <label htmlFor="prof-goal" className="form-label">
                Annual Reading Goal (Books / Year)
              </label>
              <div className="input-wrapper">
                <Target size={18} className="input-icon" />
                <input
                  id="prof-goal"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.readingGoalTarget}
                  onChange={(e) =>
                    setFormData({ ...formData, readingGoalTarget: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>

            {/* Preferred Topics */}
            <div className="form-group">
              <label className="form-label">
                AI Recommendation Interests
              </label>
              <div className="genre-pill-selector">
                {ALL_GENRES.map((genre) => {
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
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSaving}
              icon={Save}
              className="profile-save-btn"
            >
              Save Changes
            </Button>
          </form>
        </div>

        {/* Right Aside: Reading Progress & Membership Card */}
        <div className="profile-aside-column">
          {/* Annual Reading Goal Card */}
          <div className="profile-card">
            <div className="goal-card-header">
              <Target size={20} color="var(--primary-700)" />
              <h3 className="goal-card-title">2026 Reading Challenge</h3>
            </div>
            <p className="goal-card-desc">
              You have completed <strong>{completedBooks}</strong> of{' '}
              <strong>{goalTarget}</strong> books this academic year.
            </p>

            <div className="goal-progress-track">
              <div
                className="goal-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="goal-progress-meta">
              <span>{progressPercent}% Complete</span>
              <span>{Math.max(0, goalTarget - completedBooks)} books to go</span>
            </div>
          </div>

          {/* Membership Credentials */}
          <div className="profile-card membership-id-card">
            <div className="membership-card-top">
              <span className="membership-card-logo">BookNest Digital Card</span>
              <span className="membership-status-dot" />
            </div>
            <div className="membership-barcode-area">
              <div className="membership-id-value">{user?.memberId}</div>
              <div className="membership-subtitle">{user?.name}</div>
            </div>
            <div className="membership-card-bottom">
              <span>Status: Active</span>
              <span>Valid Thru: Aug 2027</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
