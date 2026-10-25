import React, { useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  Filter,
  Grid,
  List,
  RotateCcw,
  BookOpen,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import {
  setFilter,
  resetFilters,
  setViewMode,
  setPage,
  fetchBooks
} from '../features/books/booksSlice';
import BookCard from '../components/books/BookCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import './ExploreBooksPage.css';

// Static list of genres for the filter dropdown.
// When books are loaded from the API these will be supplemented dynamically.
const KNOWN_GENRES = [
  'All',
  'Computer Science',
  'Artificial Intelligence',
  'Data Science',
  'Software Architecture',
  'Mathematics',
  'Philosophy',
  'Psychology',
  'History',
  'Sci-Fi',
  'Biography'
];

export const ExploreBooksPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const allBooks = useSelector((state) => state.books.items);
  const filters = useSelector((state) => state.books.filters);
  const viewMode = useSelector((state) => state.books.viewMode);
  const loading = useSelector((state) => state.books.loading);
  const pagination = useSelector((state) => state.books.pagination);

  // ── Sync search query param from URL ────────────────────────────────────
  const queryParamSearch = searchParams.get('search');
  useEffect(() => {
    if (queryParamSearch !== null && queryParamSearch !== filters.search) {
      dispatch(setFilter({ search: queryParamSearch }));
    }
  }, [queryParamSearch, dispatch, filters.search]);

  // ── Fetch books from API whenever filters or page changes ─────────────────
  const doFetch = useCallback(() => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      sortBy: filters.sortBy
    };
    if (filters.search) params.search = filters.search;
    if (filters.genre && filters.genre !== 'All') params.genre = filters.genre;
    if (filters.availability && filters.availability !== 'all') params.availability = filters.availability;
    dispatch(fetchBooks(params));
  }, [dispatch, filters, pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  // ── Derive genres from loaded books (supplement static list) ─────────────
  const genres = useMemo(() => {
    const fromBooks = allBooks.map((b) => b.genre).filter(Boolean);
    const merged = new Set([...KNOWN_GENRES, ...fromBooks]);
    return Array.from(merged);
  }, [allBooks]);

  const { currentPage, totalPages = 1, total = 0 } = pagination;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    dispatch(setFilter({ search: val }));
    setSearchParams(val ? { search: val } : {});
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setSearchParams({});
  };

  return (
    <div className="explore-container fade-in">
      <div className="explore-header-row">
        <div className="explore-title-group">
          <h1>Library Catalogue</h1>
          <p>
            Browse, search, and borrow from our collection of titles in science, engineering, fiction, and philosophy.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Badge variant="neutral" size="md">
            {total > 0 ? `${total} Books` : `${allBooks.length} Books`}
          </Badge>
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => dispatch(setViewMode('grid'))}
              title="Grid View"
              aria-label="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => dispatch(setViewMode('list'))}
              title="List View"
              aria-label="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <div className="filter-top-row">
          <div className="filter-search-box">
            <Search size={18} className="filter-search-icon" />
            <input
              type="search"
              placeholder="Search by title, author, genre, or ISBN..."
              value={filters.search}
              onChange={handleSearchChange}
              className="filter-search-input"
              aria-label="Search catalogue books"
            />
          </div>

          <div className="filter-controls-group">
            {/* Genre Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Filter size={16} color="var(--text-muted)" />
              <select
                className="filter-select"
                value={filters.genre}
                onChange={(e) => dispatch(setFilter({ genre: e.target.value }))}
                aria-label="Filter by Genre"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g === 'All' ? 'All Genres' : g}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <select
              className="filter-select"
              value={filters.availability}
              onChange={(e) => dispatch(setFilter({ availability: e.target.value }))}
              aria-label="Filter by Availability"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Now</option>
              <option value="unavailable">Currently Borrowed</option>
            </select>

            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ArrowUpDown size={16} color="var(--text-muted)" />
              <select
                className="filter-select"
                value={filters.sortBy}
                onChange={(e) => dispatch(setFilter({ sortBy: e.target.value }))}
                aria-label="Sort books by"
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="year-desc">Newest Publication</option>
              </select>
            </div>

            {/* Reset Button */}
            {(filters.search || filters.genre !== 'All' || filters.availability !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={handleReset}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 size={36} className="spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      )}

      {/* Book Grid / List */}
      {!loading && allBooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No matching books found"
          description="We couldn't find any titles matching your current filter settings. Try adjusting your query or resetting all filters."
          actionLabel="Clear All Filters"
          onAction={handleReset}
        />
      ) : (
        !loading && (
          <div className={viewMode === 'list' ? 'books-list-wrapper' : 'books-grid'}>
            {allBooks.map((book) => (
              <BookCard key={book._id || book.id} book={book} viewMode={viewMode} />
            ))}
          </div>
        )
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="pagination-container">
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages} ({total} total)
          </span>

          <div className="pagination-pages">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => dispatch(setPage(currentPage - 1))}
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => dispatch(setPage(page))}
              >
                {page}
              </button>
            ))}

            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => dispatch(setPage(currentPage + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreBooksPage;
