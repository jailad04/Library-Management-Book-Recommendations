import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Star, Sparkles, BookCheck, ArrowRight, BookOpen } from 'lucide-react';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { borrowBook } from '../../features/borrowings/borrowingSlice';
import { addToast } from '../../features/ui/uiSlice';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './BookCard.css';

// Inline SVG placeholder — no external dependency
const BookPlaceholder = ({ title }) => (
  <div className="book-cover-placeholder">
    <BookOpen size={32} strokeWidth={1.2} />
    <span>{title?.slice(0, 30)}</span>
  </div>
);

export const BookCard = ({
  book,
  viewMode = 'grid',
  recommendationReason = null,
  similarityScore = null,
  showBorrowAction = true
}) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.bookIds);
  const borrowings = useSelector((state) => state.borrowings.items);
  const isWishlisted = wishlist.includes(book.id);

  const isCurrentlyBorrowed = borrowings.some(
    (b) => b.bookId === book.id && (b.status === 'active' || b.status === 'due-soon')
  );

  const isAvailable = book.availableCopies > 0;
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(book.id));
    dispatch(
      addToast({
        type: isWishlisted ? 'info' : 'success',
        message: isWishlisted
          ? `Removed "${book.title}" from your wishlist.`
          : `Saved "${book.title}" to your wishlist!`
      })
    );
  };

  const handleBorrow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) {
      dispatch(addToast({ type: 'warning', message: `All copies of "${book.title}" are currently borrowed.` }));
      return;
    }
    if (isCurrentlyBorrowed) {
      dispatch(addToast({ type: 'info', message: `You already have an active borrowing for "${book.title}".` }));
      return;
    }

    dispatch(borrowBook({ bookId: book.id, bookTitle: book.title, bookAuthor: book.author, bookCover: book.coverUrl }));
    dispatch(addToast({ type: 'success', message: `Borrowed "${book.title}" — due in 14 days.` }));
  };

  return (
    <article className={`book-card ${viewMode === 'list' ? 'book-card-list' : ''}`}>
      {/* Cover */}
      <div className="book-cover-container">
        {!imageError && book.coverUrl ? (
          <>
            {!imageLoaded && <div className="book-cover-shimmer skeleton" />}
            <img
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              className={`book-cover-img ${imageLoaded ? 'loaded' : ''}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <BookPlaceholder title={book.title} />
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`book-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Availability ribbon */}
        {!isAvailable && !isCurrentlyBorrowed && (
          <div className="book-unavailable-ribbon">Unavailable</div>
        )}
      </div>

      {/* Content */}
      <div className="book-content">
        <div className="book-genre-row">
          <Badge variant="neutral" size="sm">{book.genre}</Badge>
          {similarityScore && (
            <Badge variant="purple" size="sm">
              <Sparkles size={11} />
              {Math.round(similarityScore * 100)}%
            </Badge>
          )}
        </div>

        <h3 className="book-title">
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        <p className="book-author">{book.author}</p>

        <div className="book-rating-row">
          <Star size={13} className="book-rating-star" />
          <span>{book.rating ? book.rating.toFixed(1) : '—'}</span>
          {book.ratingCount && (
            <span className="book-rating-count">({book.ratingCount})</span>
          )}
        </div>

        {recommendationReason && (
          <div className="book-rec-reason">
            <Sparkles size={13} style={{ flexShrink: 0 }} />
            <span>{recommendationReason}</span>
          </div>
        )}

        <div className="book-footer">
          <div className="book-copies-indicator">
            {isCurrentlyBorrowed ? (
              <Badge variant="warning" size="sm"><BookCheck size={11} /> On Loan</Badge>
            ) : isAvailable ? (
              <Badge variant="success" size="sm">{book.availableCopies} available</Badge>
            ) : (
              <Badge variant="danger" size="sm">Unavailable</Badge>
            )}
          </div>

          <div className="book-actions">
            <Link to={`/books/${book.id}`}>
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">View</Button>
            </Link>
            {showBorrowAction && (
              <Button
                variant={isCurrentlyBorrowed ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleBorrow}
                disabled={!isAvailable || isCurrentlyBorrowed}
              >
                {isCurrentlyBorrowed ? 'Borrowed' : 'Borrow'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BookCard;
