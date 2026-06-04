import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { booksApi } from '../api/booksApi';
import type { Book, CreateBookRequest } from '../api/booksApi';
import BookForm from '../components/BookForm';

export default function BooksPage() {
  const { authState } = useOktaAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const token = authState?.accessToken?.accessToken ?? '';

  useEffect(() => {
    if (!token) return;
    // Decode and log token claims for debugging
    booksApi.getAll(token)
      .then(setBooks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreate = async (req: CreateBookRequest) => {
    setSaving(true);
    try {
      const created = await booksApi.create(token, req);
      setBooks(prev => [...prev, created]);
      setShowForm(false);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book?')) return;
    try {
      await booksApi.delete(token, id);
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  };

  if (loading) return <p className="status-msg">Loading books…</p>;
  if (error) return <p className="status-msg error">Error: {error}</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Books</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Book</button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Book</h2>
            <BookForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </div>
        </div>
      )}

      <table className="books-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>Year</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>
                <button className="link-btn" onClick={() => navigate(`/books/${book.id}`)}>
                  {book.title}
                </button>
              </td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.year}</td>
              <td>${book.price.toFixed(2)}</td>
              <td>{book.inStock ? '✓' : '✗'}</td>
              <td>
                <button className="btn-danger-sm" onClick={() => handleDelete(book.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
