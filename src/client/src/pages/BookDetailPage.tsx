import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { booksApi } from '../api/booksApi';
import type { Book, CreateBookRequest } from '../api/booksApi';
import BookForm from '../components/BookForm';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { authState } = useOktaAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = authState?.accessToken?.accessToken ?? '';

  useEffect(() => {
    if (!token || !id) return;
    booksApi.getById(token, id)
      .then(setBook)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, id]);

  const handleUpdate = async (req: CreateBookRequest) => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await booksApi.update(token, id, req);
      setBook(updated);
      setEditing(false);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="status-msg">Loading…</p>;
  if (error) return <p className="status-msg error">Error: {error}</p>;
  if (!book) return <p className="status-msg">Book not found.</p>;

  return (
    <div className="page detail-page">
      <button className="btn-back" onClick={() => navigate('/')}>← Back to Books</button>

      {editing ? (
        <>
          <h1>Edit Book</h1>
          <BookForm
            initial={book}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            loading={saving}
          />
        </>
      ) : (
        <>
          <div className="detail-header">
            <h1>{book.title}</h1>
            <button className="btn-primary" onClick={() => setEditing(true)}>Edit</button>
          </div>
          <dl className="detail-list">
            <dt>Author</dt><dd>{book.author}</dd>
            <dt>ISBN</dt><dd>{book.isbn}</dd>
            <dt>Year</dt><dd>{book.year}</dd>
            <dt>Genre</dt><dd>{book.genre}</dd>
            <dt>Price</dt><dd>${book.price.toFixed(2)}</dd>
            <dt>In Stock</dt><dd>{book.inStock ? 'Yes' : 'No'}</dd>
          </dl>
        </>
      )}
    </div>
  );
}
