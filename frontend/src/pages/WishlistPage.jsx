import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, Compass } from 'lucide-react';
import BookCard from '../components/books/BookCard';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import './WishlistPage.css';

export const WishlistPage = () => {
  const wishlistIds = useSelector((state) => state.wishlist.bookIds);
  const allBooks = useSelector((state) => state.books.items);
  const viewMode = useSelector((state) => state.books.viewMode || 'grid');

  // Find book objects for IDs in wishlist — check _id, customId, and id
  const wishlistBooks = allBooks.filter((book) =>
    wishlistIds.some(wId =>
      wId === book._id || wId === book.id || wId === book.customId
    )
  );

  return (
    <div className="wishlist-page">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <h1 className="page-heading">My Saved Wishlist</h1>
          <p className="page-subheading">
            Books you have bookmarked to read next. Keep track of available copies and shelf locations.
          </p>
        </div>
        <Link to="/books">
          <Button variant="outline" size="sm" icon={Compass}>
            Explore More Books
          </Button>
        </Link>
      </div>

      {/* Wishlist Grid */}
      {wishlistBooks.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="You haven't saved any books to your wishlist yet. Browse the catalogue and click the heart icon on any title you'd like to read later."
          actionLabel="Browse Catalogue"
          onAction={() => (window.location.href = '/books')}
        />
      ) : (
        <div>
          <div className="wishlist-meta-bar">
            <span className="wishlist-count-badge">
              <strong>{wishlistBooks.length}</strong> {wishlistBooks.length === 1 ? 'book' : 'books'} saved
            </span>
          </div>

          <div className="books-grid">
            {wishlistBooks.map((book) => (
              <BookCard key={book.id} book={book} viewMode={viewMode} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
