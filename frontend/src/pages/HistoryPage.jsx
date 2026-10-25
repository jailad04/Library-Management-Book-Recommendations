import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  History,
  CheckCircle,
  Clock,
  Calendar,
  BookOpen,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import './HistoryPage.css';

export const HistoryPage = () => {
  const borrowings = useSelector((state) => state.borrowings.items);
  const [filter, setFilter] = useState('all'); // 'all', 'returned', 'active'

  const returnedList = borrowings.filter((b) => b.status === 'returned');
  const activeList = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'due-soon'
  );

  const displayedList = borrowings.filter((item) => {
    if (filter === 'returned') return item.status === 'returned';
    if (filter === 'active') return item.status === 'active' || item.status === 'due-soon';
    return true;
  });

  return (
    <div className="history-page">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <h1 className="page-heading">Reading & Borrowing History</h1>
          <p className="page-subheading">
            A comprehensive record of books you have borrowed, completed, and returned.
          </p>
        </div>
        <Link to="/books">
          <Button variant="outline" size="sm" icon={BookOpen}>
            Discover Next Book
          </Button>
        </Link>
      </div>

      {/* Overview Stats Bar */}
      <div className="history-summary-grid">
        <div className="history-stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-forest-green)' }}>
            <BookMarked size={20} />
          </div>
          <div>
            <div className="stat-number">{borrowings.length}</div>
            <div className="stat-label">Total Loans Recorded</div>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-sage)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-number">{returnedList.length}</div>
            <div className="stat-label">Completed & Returned</div>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="stat-icon-wrapper" style={{ color: 'var(--color-amber)' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-number">{activeList.length}</div>
            <div className="stat-label">Currently in Progress</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="history-filter-bar">
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All History ({borrowings.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'returned' ? 'active' : ''}`}
            onClick={() => setFilter('returned')}
          >
            Completed ({returnedList.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Ongoing ({activeList.length})
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {displayedList.length === 0 ? (
        <EmptyState
          icon={History}
          title="No history records found"
          description="You do not have any borrowing history records matching this filter."
          actionLabel="Explore Catalogue"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="history-timeline">
          {displayedList.map((item, idx) => {
            const isReturned = item.status === 'returned';

            return (
              <div key={item.id} className="timeline-entry">
                <div className="timeline-marker">
                  <div className={`timeline-dot ${isReturned ? 'returned' : 'active'}`} />
                  {idx < displayedList.length - 1 && <div className="timeline-line" />}
                </div>

                <div className="timeline-card">
                  <div className="timeline-cover-wrapper">
                    <img
                      src={item.bookCover}
                      alt={item.bookTitle}
                      className="timeline-cover-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="timeline-cover-fallback"
                      style={{ display: 'none' }}
                    >
                      <BookOpen size={20} />
                    </div>
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-header-meta">
                      {isReturned ? (
                        <Badge variant="neutral" icon={CheckCircle}>
                          Returned on {item.returnDate}
                        </Badge>
                      ) : (
                        <Badge variant="success" icon={Clock}>
                          Active (Due {item.dueDate})
                        </Badge>
                      )}
                      <span className="timeline-date-borrowed">
                        <Calendar size={12} /> Loaned {item.borrowDate}
                      </span>
                    </div>

                    <h3 className="timeline-title">
                      <Link to={`/books/${item.bookId}`}>{item.bookTitle}</Link>
                    </h3>
                    <p className="timeline-author">By {item.bookAuthor}</p>

                    <div className="timeline-footer-actions">
                      <Link to={`/books/${item.bookId}`} className="timeline-view-link">
                        <span>View Book Details</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
