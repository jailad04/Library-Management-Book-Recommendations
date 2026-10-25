import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  BookMarked,
  Calendar,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  Loader2
} from 'lucide-react';
import {
  setActiveFilter,
  fetchMyBorrowings,
  returnBookThunk,
  renewBookThunk
} from '../features/borrowings/borrowingSlice';
import { addToast } from '../features/ui/uiSlice';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import './BorrowingsPage.css';

export const BorrowingsPage = () => {
  const dispatch = useDispatch();
  const borrowings = useSelector((state) => state.borrowings.items);
  const loading = useSelector((state) => state.borrowings.loading);
  const actionLoading = useSelector((state) => state.borrowings.actionLoading);
  const activeFilter = useSelector((state) => state.borrowings.activeFilter || 'all');

  const [confirmReturnId, setConfirmReturnId] = useState(null);

  // Fetch borrowings from API on mount
  useEffect(() => {
    dispatch(fetchMyBorrowings());
  }, [dispatch]);

  // Filter items client-side (already fetched)
  const filteredItems = borrowings.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return item.status === 'active' || item.status === 'due-soon';
    if (activeFilter === 'due-soon') return item.status === 'due-soon';
    if (activeFilter === 'returned') return item.status === 'returned';
    return true;
  });

  const getId = (b) => b.customId || b._id || b.id;

  const activeCount = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'due-soon'
  ).length;
  const dueSoonCount = borrowings.filter((b) => b.status === 'due-soon').length;
  const returnedCount = borrowings.filter((b) => b.status === 'returned').length;

  const handleReturn = async (borrowing) => {
    const id = getId(borrowing);
    const result = await dispatch(returnBookThunk(id));
    if (returnBookThunk.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `Successfully returned "${borrowing.bookTitle}". Thank you!` }));
    } else {
      dispatch(addToast({ type: 'error', message: result.payload || 'Failed to return book.' }));
    }
    setConfirmReturnId(null);
  };

  const handleRenew = async (borrowing) => {
    if (borrowing.renewalsLeft <= 0) {
      dispatch(addToast({ type: 'warning', message: `No renewals remaining for "${borrowing.bookTitle}". Please return the book.` }));
      return;
    }
    const id = getId(borrowing);
    const result = await dispatch(renewBookThunk(id));
    if (renewBookThunk.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `Renewed "${borrowing.bookTitle}" for 14 additional days.` }));
    } else {
      dispatch(addToast({ type: 'error', message: result.payload || 'Failed to renew book.' }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'due-soon':
        return (
          <Badge variant="warning" icon={AlertTriangle}>
            Due Soon
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="success" icon={Clock}>
            Active Loan
          </Badge>
        );
      case 'returned':
        return (
          <Badge variant="neutral" icon={CheckCircle}>
            Returned
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="borrowings-page">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <h1 className="page-heading">My Borrowed Books</h1>
          <p className="page-subheading">
            Track your current loans, renewal allowances, and return deadlines.
          </p>
        </div>
        <Link to="/books">
          <Button variant="outline" size="sm" icon={BookOpen}>
            Browse Catalogue
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="borrowings-filter-bar">
        <div className="filter-pill-group">
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveFilter('all'))}
          >
            All Loans ({borrowings.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveFilter('active'))}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'due-soon' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveFilter('due-soon'))}
          >
            Due Soon ({dueSoonCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'returned' ? 'active' : ''}`}
            onClick={() => dispatch(setActiveFilter('returned'))}
          >
            Returned ({returnedCount})
          </button>
        </div>
      </div>

      {/* Borrowing Cards List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title={`No ${activeFilter !== 'all' ? activeFilter : ''} borrowings found`}
          description={
            activeFilter === 'returned'
              ? 'You have not returned any books yet.'
              : 'You have no current loans in this category. Explore the catalogue to borrow a book!'
          }
          actionLabel="Explore Books"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div className="borrowings-list">
          {filteredItems.map((item) => {
            const isReturned = item.status === 'returned';

            return (
              <div
                key={item.id}
                className={`borrowing-card ${item.status === 'due-soon' ? 'status-due-soon-border' : ''}`}
              >
                {/* Book Cover */}
                <div className="borrowing-cover-wrapper">
                  <img
                    src={item.bookCover}
                    alt={item.bookTitle}
                    className="borrowing-cover-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="borrowing-cover-fallback"
                    style={{ display: 'none' }}
                  >
                    <BookOpen size={24} />
                  </div>
                </div>

                {/* Details */}
                <div className="borrowing-details">
                  <div className="borrowing-top-meta">
                    {getStatusBadge(item.status)}
                    <span className="borrowing-id-label">Loan #{item.id}</span>
                  </div>

                  <h3 className="borrowing-title">
                    <Link to={`/books/${item.bookId}`}>{item.bookTitle}</Link>
                  </h3>
                  <p className="borrowing-author">By {item.bookAuthor}</p>

                  <div className="borrowing-dates-grid">
                    <div className="date-item">
                      <span className="date-label">Borrowed On</span>
                      <span className="date-val">
                        <Calendar size={13} /> {item.borrowDate}
                      </span>
                    </div>

                    <div className="date-item">
                      <span className="date-label">
                        {isReturned ? 'Returned On' : 'Due Date'}
                      </span>
                      <span
                        className={`date-val ${
                          item.status === 'due-soon' ? 'text-due-warning' : ''
                        }`}
                      >
                        <Clock size={13} /> {isReturned ? item.returnDate : item.dueDate}
                      </span>
                    </div>

                    {!isReturned && (
                      <div className="date-item">
                        <span className="date-label">Renewals Left</span>
                        <span className="date-val">
                          <strong>{item.renewalsLeft}</strong> of 2
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="borrowing-actions">
                  {!isReturned ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={RotateCcw}
                        disabled={item.renewalsLeft <= 0}
                        onClick={() => handleRenew(item)}
                        title={
                          item.renewalsLeft <= 0
                            ? 'Maximum renewals reached'
                            : 'Extend due date by 14 days'
                        }
                      >
                        Renew (+14d)
                      </Button>

                      {confirmReturnId === item.id ? (
                        <div className="confirm-return-popover">
                          <span>Confirm return?</span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleReturn(item)}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmReturnId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle}
                          onClick={() => setConfirmReturnId(item.id)}
                        >
                          Return Book
                        </Button>
                      )}
                    </>
                  ) : (
                    <Link to={`/books/${item.bookId}`}>
                      <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                        Borrow Again
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BorrowingsPage;
