import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BookOpen,
  CheckCircle,
  BookMarked,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
  Info
} from 'lucide-react';
import BookCard from '../components/books/BookCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import './DashboardPage.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const books = useSelector((state) => state.books.items);
  const borrowings = useSelector((state) => state.borrowings.items);
  const recommendations = useSelector((state) => state.recommendations.items);

  // Compute live dynamic statistics from store
  const totalBooks = books.length;
  const availableCopies = books.reduce((acc, curr) => acc + (curr.availableCopies || 0), 0);
  const userBorrowings = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'due-soon'
  );
  const overdueCount = borrowings.filter((b) => b.status === 'overdue').length;

  const popularBooks = books.slice(0, 4);
  const recentRecommendations = recommendations.slice(0, 3);
  const recentBorrowings = borrowings.slice(0, 4);

  return (
    <div className="dashboard-container fade-in">
      {/* Dev / Portfolio Notice regarding Mock Fallback Layer */}
      <aside aria-label="Development environment notice" className="dev-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={16} />
          <span>
            <strong>PBL & Academic Notice:</strong> Running in development mode with active Redux store & Open Library API book covers. Ready for Node.js/Express & FastAPI microservices.
          </span>
        </div>
        <Badge variant="neutral" size="sm">
          Vite + Redux Connected
        </Badge>
      </aside>

      {/* Personalized Literary Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-tag">Library Intelligence System</div>
          <h1 className="welcome-title">
            Welcome back, {user ? user.name : 'Student Scholar'}
          </h1>
          <p className="welcome-subtitle">
            Explore curated academic textbooks, reserve research materials, and review personalized
            reading suggestions tailored to your {user?.department || 'academic'} curriculum.
          </p>
          <div className="welcome-actions">
            <Button
              variant="secondary"
              size="md"
              icon={Compass}
              onClick={() => navigate('/books')}
            >
              Explore Catalogue
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={Sparkles}
              onClick={() => navigate('/recommendations')}
              className="welcome-ghost-btn"
            >
              AI Recommendations
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={BookMarked}
              onClick={() => navigate('/borrowings')}
              className="welcome-ghost-btn"
            >
              My Borrowings ({userBorrowings.length})
            </Button>
          </div>
        </div>
      </section>

      {/* KPI Stats Metrics Grid */}
      <section className="stats-grid" aria-label="Library Overview Statistics">
        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}
          >
            <BookOpen size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Titles</span>
            <span className="stat-value">{totalBooks}</span>
            <span className="stat-subtext">Catalogued volumes</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: '#ecfdf5', color: '#059669' }}
          >
            <CheckCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Available Copies</span>
            <span className="stat-value">{availableCopies}</span>
            <span className="stat-subtext">Ready for loan</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: '#fffbeb', color: '#d97706' }}
          >
            <BookMarked size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">My Active Loans</span>
            <span className="stat-value">{userBorrowings.length}</span>
            <span className="stat-subtext">Active borrowings</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
          >
            <AlertTriangle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Overdue Alerts</span>
            <span className="stat-value">{overdueCount}</span>
            <span className="stat-subtext">{overdueCount === 0 ? 'All loans in good standing' : 'Action required'}</span>
          </div>
        </div>

        <div className="stat-card">
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-800)' }}
          >
            <Sparkles size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">AI Matches</span>
            <span className="stat-value">{recommendations.length}</span>
            <span className="stat-subtext">Curated recommendations</span>
          </div>
        </div>
      </section>

      {/* Main Split: Recommended Books & Recent Borrowing Activity */}
      <div className="dashboard-split-grid">
        {/* Recommended For You Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <Sparkles size={20} color="var(--primary-700)" />
              <h2 className="section-title">Recommended For You</h2>
              <Badge variant="purple" size="sm">
                AI Match
              </Badge>
            </div>
            <Link to="/recommendations">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                View All
              </Button>
            </Link>
          </div>

          <div className="books-grid">
            {recentRecommendations.map((rec) => (
              <BookCard
                key={rec.id}
                book={rec.book}
                recommendationReason={rec.reasonExplanation}
                similarityScore={rec.similarityScore}
              />
            ))}
          </div>
        </section>

        {/* Recent Borrowing Activity Side Card */}
        <section className="dashboard-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <Clock size={20} color="var(--primary-700)" />
              <h2 className="section-title">Borrowing Activity</h2>
            </div>
            <Link to="/borrowings">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                History
              </Button>
            </Link>
          </div>

          <div className="activity-card">
            {recentBorrowings.map((borrowing) => {
              const statusBadgeVariants = {
                active: 'info',
                'due-soon': 'warning',
                overdue: 'danger',
                returned: 'neutral'
              };

              return (
                <div key={borrowing.id} className="activity-item">
                  <div className="activity-book">
                    <img
                      src={borrowing.bookCover}
                      alt={borrowing.bookTitle}
                      className="activity-thumb"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="activity-thumb-fallback"
                      style={{ display: 'none' }}
                    >
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div className="activity-title">
                        <Link to={`/books/${borrowing.bookId}`}>{borrowing.bookTitle}</Link>
                      </div>
                      <div className="activity-author">by {borrowing.bookAuthor}</div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <Badge variant={statusBadgeVariants[borrowing.status] || 'neutral'} size="sm">
                          {borrowing.status === 'due-soon' ? 'Due Tomorrow' : borrowing.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="activity-due">
                    <div style={{ color: 'var(--text-muted)' }}>Due Date</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {borrowing.dueDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reading Target Progress Card */}
          {user?.readingGoal && (
            <Card padding="1.25rem" style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Semester Reading Target</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                  {user.readingGoal.completed} of {user.readingGoal.target} books read
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (user.readingGoal.completed / user.readingGoal.target) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary-600)',
                    borderRadius: 'var(--radius-full)'
                  }}
                />
              </div>
            </Card>
          )}
        </section>
      </div>

      {/* Popular Books Section */}
      <section className="dashboard-section" style={{ marginTop: '0.5rem' }}>
        <div className="section-header">
          <div className="section-title-wrap">
            <TrendingUp size={20} color="var(--primary-700)" />
            <h2 className="section-title">Popular in Catalogue</h2>
            <Badge variant="neutral" size="sm">
              Highest Rated
            </Badge>
          </div>
          <Link to="/books">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              Explore All Books
            </Button>
          </Link>
        </div>

        <div className="books-grid">
          {popularBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
