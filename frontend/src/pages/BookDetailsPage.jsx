import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Star,
  Heart,
  BookOpen,
  MapPin,
  Send,
  Sparkles,
  BookCheck,
  CheckCircle2
} from 'lucide-react';
import { borrowBookThunk } from '../features/borrowings/borrowingSlice';
import { toggleWishlistThunk } from '../features/wishlist/wishlistSlice';
import { createReviewThunk } from '../features/reviews/reviewsSlice';
import { fetchBookById } from '../features/books/booksSlice';
import { addToast } from '../features/ui/uiSlice';
import BookCard from '../components/books/BookCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import './BookDetailsPage.css';

export const BookDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const allBooks = useSelector((state) => state.books.items);
  const selectedBook = useSelector((state) => state.books.selectedBook);
  const user = useSelector((state) => state.auth.user);
  const wishlist = useSelector((state) => state.wishlist.bookIds);
  const borrowings = useSelector((state) => state.borrowings.items);
  const allReviews = useSelector((state) => state.reviews.items);

  // Try to find book in catalogue first; fall back to selectedBook from API
  const book = allBooks.find((b) => b._id === id || b.id === id || b.customId === id) || selectedBook;

  // If not found in local list, fetch from API
  useEffect(() => {
    if (!book) {
      dispatch(fetchBookById(id));
    }
  }, [id, book, dispatch]);

  const bookId = book?._id || book?.id || book?.customId || id;
  const isWishlisted = wishlist.includes(bookId) || wishlist.includes(id);

  // Check if currently borrowed by this user
  const isCurrentlyBorrowed = borrowings.some(
    (b) => (b.bookId === bookId || b.bookId === id) && (b.status === 'active' || b.status === 'due-soon')
  );

  // Filter reviews for this book
  const bookReviews = allReviews.filter((r) => r.bookId === bookId || r.bookId === id);

  // Review form state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Find similar books in the same genre
  const similarBooks = allBooks.filter((b) => b.genre === book?.genre && b._id !== bookId && b.id !== id).slice(0, 3);

  if (!book) {
    return (
      <div className="book-details-container fade-in" style={{ padding: '2rem 0' }}>
        <EmptyState
          icon={BookOpen}
          title="Book Not Found"
          description={`We couldn't locate any catalogue record for ID: "${id}". It may have been archived or removed.`}
          actionLabel="Back to Catalogue"
          onAction={() => navigate('/books')}
        />
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;

  const handleBorrow = async () => {
    if (!isAvailable) {
      dispatch(addToast({ type: 'warning', message: 'No available copies for checkout.' }));
      return;
    }
    if (isCurrentlyBorrowed) {
      dispatch(addToast({ type: 'info', message: 'You already have an active loan for this book.' }));
      return;
    }
    const result = await dispatch(borrowBookThunk(bookId));
    if (borrowBookThunk.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', message: `Checkout confirmed! "${book.title}" added to your borrowed books.` }));
    } else {
      dispatch(addToast({ type: 'danger', message: result.payload || 'Failed to borrow book.' }));
    }
  };

  const handleWishlistToggle = async () => {
    const result = await dispatch(toggleWishlistThunk(bookId));
    if (toggleWishlistThunk.fulfilled.match(result)) {
      dispatch(addToast({
        type: result.payload.isWishlisted ? 'success' : 'info',
        message: result.payload.isWishlisted
          ? `Saved "${book.title}" to your wishlist!`
          : `Removed "${book.title}" from your wishlist.`
      }));
    } else {
      dispatch(addToast({ type: 'danger', message: result.payload || 'Failed to update wishlist.' }));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setSubmittingReview(true);
    const result = await dispatch(createReviewThunk({
      bookId,
      rating: ratingInput,
      comment: commentInput.trim()
    }));
    if (createReviewThunk.fulfilled.match(result)) {
      setCommentInput('');
      dispatch(addToast({ type: 'success', message: 'Your review has been published!' }));
    } else {
      dispatch(addToast({ type: 'danger', message: result.payload || 'Failed to submit review.' }));
    }
    setSubmittingReview(false);
  };

  return (
    <div className="book-details-container fade-in">
      {/* Back button */}
      <div>
        <Link to="/books" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Catalogue
        </Link>
      </div>

      {/* Main Details Hero */}
      <section className="details-hero-card">
        <div className="details-cover-box">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="details-cover-img"
          />

          <Button
            variant={isWishlisted ? 'secondary' : 'outline'}
            icon={Heart}
            onClick={handleWishlistToggle}
            style={{ width: '100%' }}
          >
            {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
          </Button>
        </div>

        <div className="details-content-box">
          <div className="details-meta-header">
            <div className="details-badges-row">
              <Badge variant="purple" size="md">
                {book.genre}
              </Badge>
              <Badge variant="neutral" size="md">
                {book.category}
              </Badge>
              {isCurrentlyBorrowed ? (
                <Badge variant="warning" size="md" icon={BookCheck}>
                  Currently On Loan to You
                </Badge>
              ) : isAvailable ? (
                <Badge variant="success" size="md" icon={CheckCircle2}>
                  Available ({book.availableCopies} of {book.totalCopies} copies)
                </Badge>
              ) : (
                <Badge variant="danger" size="md">
                  All Copies Borrowed
                </Badge>
              )}
            </div>

            <h1 className="details-title">{book.title}</h1>
            <p className="details-author">by {book.author}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', color: 'var(--accent-gold)' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(book.rating || 4.5) ? 'var(--accent-gold)' : 'none'}
                  />
                ))}
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{book.rating || 4.8}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                ({book.ratingCount || 150} global ratings)
              </span>
            </div>
          </div>

          {/* Description */}
          <div style={{ lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {book.description}
          </div>

          {/* Metadata Specifications Grid */}
          <div className="details-specs-grid">
            <div className="spec-item">
              <span className="spec-label">ISBN-13</span>
              <span className="spec-value">{book.isbn}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Published</span>
              <span className="spec-value">{book.publishedYear}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Publisher</span>
              <span className="spec-value">{book.publisher || 'Academic Press'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Pages</span>
              <span className="spec-value">{book.pages || 450}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Shelf Location</span>
              <span className="spec-value" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={12} color="var(--primary-600)" />
                {book.shelfLocation || 'Floor 2 - Section B'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="details-actions-row">
            <Button
              variant="primary"
              size="lg"
              icon={BookOpen}
              onClick={handleBorrow}
              disabled={!isAvailable || isCurrentlyBorrowed}
            >
              {isCurrentlyBorrowed ? 'Already In Your Active Loans' : isAvailable ? 'Borrow This Book (14 Days)' : 'Reserve Next Copy'}
            </Button>
          </div>
        </div>
      </section>

      {/* User Reviews & Ratings Section */}
      <section className="reviews-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Peer Reviews & Academic Notes</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Feedback submitted by students and faculty members.
            </p>
          </div>
          <Badge variant="neutral" size="md">
            {bookReviews.length} Reviews
          </Badge>
        </div>

        {/* Submit Review Card */}
        <div className="review-form-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Leave a Review
          </h3>
          <form onSubmit={handleReviewSubmit}>
            <div className="review-input-group">
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Your Star Rating</label>
              <div className="star-rating-select">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= ratingInput ? 'active' : ''}`}
                    onClick={() => setRatingInput(star)}
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={22}
                      fill={star <= ratingInput ? 'var(--accent-gold)' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="review-input-group">
              <label htmlFor="review-textarea" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                Review Comments
              </label>
              <textarea
                id="review-textarea"
                rows={3}
                placeholder="Share your thoughts on this book's depth, readability, and relevance..."
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                style={{ resize: 'vertical' }}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              loading={submittingReview}
              disabled={!commentInput.trim()}
            >
              Post Review
            </Button>
          </form>
        </div>

        {/* Review List */}
        {bookReviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
            No reviews submitted for this title yet. Be the first to share your notes!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {bookReviews.map((rev) => (
              <div key={rev.id} className="review-card">
                <div className="review-header">
                  <div>
                    <strong style={{ fontSize: '0.875rem' }}>{rev.userName}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                      ({rev.userRole})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', color: 'var(--accent-gold)' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={s <= rev.rating ? 'var(--accent-gold)' : 'none'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {rev.date}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Similar Books Section */}
      {similarBooks.length > 0 && (
        <section style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles size={20} color="var(--color-purple)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Similar Books in {book.genre}
            </h2>
          </div>

          <div className="books-grid">
            {similarBooks.map((simBook) => (
              <BookCard key={simBook.id} book={simBook} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BookDetailsPage;
