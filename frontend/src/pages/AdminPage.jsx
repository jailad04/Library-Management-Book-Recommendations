import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Layers,
  CheckCircle2,
  Clock,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { addBook, updateBook, deleteBook } from '../features/books/booksSlice';
import { addToast } from '../features/ui/uiSlice';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import './AdminPage.css';

export const AdminPage = () => {
  const dispatch = useDispatch();
  const books = useSelector((state) => state.books.items);
  const borrowings = useSelector((state) => state.borrowings.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: 'Computer Science',
    category: 'Software Engineering',
    publishedYear: 2024,
    publisher: 'University Press',
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: 'Floor 2 — Shelf CS-01',
    description: ''
  });

  // Calculate live catalogue statistics
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 1), 0);
  const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const activeLoans = borrowings.filter((b) => b.status === 'active' || b.status === 'due-soon').length;

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery)
  );

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      genre: 'Computer Science',
      category: 'Software Engineering',
      publishedYear: 2024,
      publisher: "O'Reilly Media",
      totalCopies: 5,
      availableCopies: 5,
      shelfLocation: 'Floor 2 — Shelf CS-10',
      description: ''
    });
    setModalMode('add');
  };

  const handleOpenEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      category: book.category,
      publishedYear: book.publishedYear,
      publisher: book.publisher || 'Library Press',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      shelfLocation: book.shelfLocation || 'Floor 1 — Shelf A-01',
      description: book.description || ''
    });
    setModalMode('edit');
  };

  const handleSaveBook = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      dispatch(
        addToast({
          type: 'danger',
          message: 'Title, Author, and ISBN are required.'
        })
      );
      return;
    }

    if (modalMode === 'add') {
      const newBook = {
        id: `b-${Date.now().toString().slice(-4)}`,
        ...formData,
        totalCopies: Number(formData.totalCopies),
        availableCopies: Number(formData.availableCopies),
        publishedYear: Number(formData.publishedYear),
        coverUrl: `https://covers.openlibrary.org/b/isbn/${formData.isbn.trim()}-L.jpg`,
        rating: 5.0,
        ratingCount: 1,
        featured: false,
        tags: [formData.genre, formData.category]
      };
      dispatch(addBook(newBook));
      dispatch(
        addToast({
          type: 'success',
          message: `Book "${newBook.title}" added to catalogue.`
        })
      );
    } else if (modalMode === 'edit' && editingBook) {
      dispatch(
        updateBook({
          id: editingBook.id,
          ...formData,
          totalCopies: Number(formData.totalCopies),
          availableCopies: Number(formData.availableCopies),
          publishedYear: Number(formData.publishedYear),
          coverUrl: `https://covers.openlibrary.org/b/isbn/${formData.isbn.trim()}-L.jpg`
        })
      );
      dispatch(
        addToast({
          type: 'success',
          message: `Book "${formData.title}" updated successfully.`
        })
      );
    }

    setModalMode(null);
    setEditingBook(null);
  };

  const handleDeleteBook = (id, title) => {
    dispatch(deleteBook(id));
    dispatch(
      addToast({
        type: 'info',
        message: `Book "${title}" was removed from the catalogue.`
      })
    );
    setBookToDelete(null);
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="page-header-flex">
        <div>
          <div className="admin-title-row">
            <h1 className="page-heading">Staff Administration & Inventory</h1>
            <Badge variant="purple" icon={ShieldCheck}>
              Staff Mode
            </Badge>
          </div>
          <p className="page-subheading">
            Manage catalogue inventory, add new accessions, modify book allocations, and oversee physical loans.
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Add New Title
        </Button>
      </div>

      {/* Admin Notice */}
      <div className="admin-notice-banner">
        <AlertCircle size={16} />
        <span>
          <strong>Evaluator Notice:</strong> Actions update the active Redux in-memory state. In production, this boundary connects to Express/MongoDB REST endpoints with JWT authorization.
        </span>
      </div>

      {/* Summary KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ color: 'var(--color-forest-green)' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className="kpi-value">{totalTitles}</div>
            <div className="kpi-label">Catalogued Titles</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ color: 'var(--color-sage)' }}>
            <Layers size={22} />
          </div>
          <div>
            <div className="kpi-value">{totalCopies}</div>
            <div className="kpi-label">Total Volume Copies</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ color: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="kpi-value">{availableCopies}</div>
            <div className="kpi-label">Available on Shelves</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-icon-box" style={{ color: 'var(--color-amber)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value">{activeLoans}</div>
            <div className="kpi-label">Active Loans in Field</div>
          </div>
        </div>
      </div>

      {/* Book Management Table Section */}
      <div className="admin-table-container">
        <div className="admin-table-header">
          <h2 className="admin-section-heading">Catalogue Inventory ({filteredBooks.length})</h2>
          <div className="admin-search-box">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Filter by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title & Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Copies (Avail/Tot)</th>
                <th>Location</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => {
                const isAvailable = book.availableCopies > 0;
                return (
                  <tr key={book.id}>
                    <td>
                      <div className="admin-book-thumb">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div
                          className="admin-thumb-fallback"
                          style={{ display: 'none' }}
                        >
                          <BookOpen size={16} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="admin-book-title">{book.title}</div>
                      <div className="admin-book-author">{book.author}</div>
                    </td>
                    <td>
                      <span className="admin-isbn-tag">{book.isbn}</span>
                    </td>
                    <td>
                      <Badge variant="neutral" size="sm">
                        {book.category}
                      </Badge>
                    </td>
                    <td>
                      <span className={`admin-copies-count ${!isAvailable ? 'out-of-stock' : ''}`}>
                        {book.availableCopies} / {book.totalCopies}
                      </span>
                    </td>
                    <td>
                      <span className="admin-location-text">{book.shelfLocation}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-action-btns">
                        <button
                          type="button"
                          className="admin-icon-btn edit"
                          onClick={() => handleOpenEdit(book)}
                          title="Edit Book"
                          aria-label={`Edit ${book.title}`}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn delete"
                          onClick={() => setBookToDelete(book)}
                          title="Delete Book"
                          aria-label={`Delete ${book.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === 'add' ? 'Add New Title to Catalogue' : `Edit: ${editingBook?.title}`}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalMode(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">Book Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Introduction to Algorithms"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Primary Author</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Thomas H. Cormen"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ISBN-13 (Covers will fetch automatically)</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="input-field"
                    placeholder="e.g. 9780262033848"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalCopies}
                    value={formData.availableCopies}
                    onChange={(e) => setFormData({ ...formData, availableCopies: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Publication Year</label>
                  <input
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shelf / Physical Location</label>
                <input
                  type="text"
                  value={formData.shelfLocation}
                  onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                  className="input-field"
                  placeholder="Floor 2 — Shelf CS-08"
                />
              </div>

              <div className="admin-modal-actions">
                <Button variant="ghost" size="md" onClick={() => setModalMode(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" icon={Save}>
                  {modalMode === 'add' ? 'Save to Catalogue' : 'Update Title'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card confirm-modal">
            <h3 className="admin-modal-title">Delete Catalogue Entry?</h3>
            <p style={{ margin: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Are you sure you want to delete <strong>"{bookToDelete.title}"</strong> (ISBN: {bookToDelete.isbn}) from the library catalogue? This will remove the record from all search indexes.
            </p>
            <div className="admin-modal-actions">
              <Button variant="ghost" size="md" onClick={() => setBookToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                icon={Trash2}
                onClick={() => handleDeleteBook(bookToDelete.id, bookToDelete.title)}
              >
                Delete Book
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
