import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Star, MessageSquare, Trash2, BookOpen, Plus, Send, Loader2 } from 'lucide-react';
import {
  fetchReviews,
  createReviewThunk,
  deleteReviewThunk
} from '../features/reviews/reviewsSlice';
import { addToast } from '../features/ui/uiSlice';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import './ReviewsPage.css';

export const ReviewsPage = () => {
  const dispatch = useDispatch();
  const reviews = useSelector((state) => state.reviews.items);
  const loading = useSelector((state) => state.reviews.loading);
  const books = useSelector((state) => state.books.items);
  const user = useSelector((state) => state.auth.user);

  const [showAddForm, setShowAddForm] = useState(false);
  // Use _id or id or customId from first book
  const [selectedBookId, setSelectedBookId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Set default selected book once books load
  useEffect(() => {
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0]._id || books[0].id || books[0].customId || '');
    }
  }, [books, selectedBookId]);

  // Fetch all reviews on mount
  useEffect(() => {
    dispatch(fetchReviews());
  }, [dispatch]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      dispatch(addToast({ type: 'danger', message: 'Please write a review comment.' }));
      return;
    }
    if (!selectedBookId) {
      dispatch(addToast({ type: 'danger', message: 'Please select a book to review.' }));
      return;
    }

    setSubmitting(true);
    const result = await dispatch(createReviewThunk({
      bookId: selectedBookId,
      rating: Number(rating),
      comment: comment.trim()
    }));

    if (createReviewThunk.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: 'Your review has been published!' }));
      setComment('');
      setRating(5);
      setShowAddForm(false);
    } else {
      dispatch(addToast({ type: 'danger', message: result.payload || 'Failed to submit review.' }));
    }
    setSubmitting(false);
  };

  const handleDelete = async (rev) => {
    const id = rev._id || rev.customId || rev.id;
    const result = await dispatch(deleteReviewThunk(id));
    if (deleteReviewThunk.fulfilled.match(result)) {
      dispatch(addToast({ type: 'info', message: 'Review deleted.' }));
    } else {
      dispatch(addToast({ type: 'danger', message: result.payload || 'Failed to delete review.' }));
    }
  };

  const canDelete = (rev) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return rev.userName === user.name || rev.user === user._id || rev.user === user.id;
  };

  // Map bookId to book object for display
  const getBook = (rev) => {
    const bId = rev.bookId;
    return books.find(b => b._id === bId || b.id === bId || b.customId === bId);
  };

  return (
    <div className="reviews-page">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <h1 className="page-heading">Peer Reviews &amp; Discussions</h1>
          <p className="page-subheading">
            Student notes, academic evaluations, and critical perspectives on library titles.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel Review' : 'Write a Review'}
        </Button>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <div className="add-review-card fade-in">
          <h2 className="add-review-title">Share Your Thoughts on a Book</h2>
          <form onSubmit={handleSubmitReview} className="add-review-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Select Book</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="input-field select-field"
                >
                  {books.map((b) => {
                    const bId = b._id || b.id || b.customId;
                    return (
                      <option key={bId} value={bId}>
                        {b.title} — {b.author}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="star-rating-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`star-pick-btn ${star <= rating ? 'active' : ''}`}
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span className="rating-label-num">{rating} of 5 Stars</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Review / Summary Notes</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you learn? How were the explanations? Who would you recommend this to?"
                className="input-field textarea-field"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={Send} loading={submitting}>
                Publish Review
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 size={32} className="spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}

      {/* Reviews List */}
      {!loading && reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews yet"
          description="Be the first reader to share a review on a borrowed title!"
          actionLabel="Write First Review"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        !loading && (
          <div className="reviews-grid">
            {reviews.map((rev) => {
              const revId = rev._id || rev.customId || rev.id;
              const book = getBook(rev);

              return (
                <div key={revId} className="review-card">
                  <div className="review-card-header">
                    <div>
                      <div className="review-user-name">{rev.userName}</div>
                      <div className="review-user-role">{rev.userRole}</div>
                    </div>
                    <div className="review-stars-row">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          color={i < rev.rating ? 'var(--color-amber)' : 'var(--border-color)'}
                          fill={i < rev.rating ? 'var(--color-amber)' : 'none'}
                        />
                      ))}
                    </div>
                  </div>

                  {book && (
                    <Link to={`/books/${book._id || book.id}`} className="review-book-reference">
                      <BookOpen size={14} />
                      <span>
                        {book.title} <span style={{ opacity: 0.7 }}>by {book.author}</span>
                      </span>
                    </Link>
                  )}

                  <p className="review-comment-text">"{rev.comment}"</p>

                  <div className="review-card-footer">
                    <span className="review-date">{rev.date}</span>
                    {canDelete(rev) && (
                      <button
                        type="button"
                        className="review-delete-btn"
                        onClick={() => handleDelete(rev)}
                        title="Delete this review"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default ReviewsPage;
