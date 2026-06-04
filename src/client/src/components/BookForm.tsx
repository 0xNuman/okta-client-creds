import { useState } from 'react';
import type { CreateBookRequest } from '../api/booksApi';

interface Props {
  initial?: CreateBookRequest;
  onSubmit: (book: CreateBookRequest) => void;
  onCancel: () => void;
  loading?: boolean;
}

const empty: CreateBookRequest = {
  title: '',
  author: '',
  isbn: '',
  year: new Date().getFullYear(),
  genre: '',
  price: 0,
  inStock: true,
};

export default function BookForm({ initial = empty, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState<CreateBookRequest>(initial);

  const set = (field: keyof CreateBookRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({
        ...prev,
        [field]: e.target.type === 'checkbox' ? e.target.checked :
                 e.target.type === 'number' ? Number(e.target.value) : e.target.value,
      }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <label>Title <input value={form.title} onChange={set('title')} required /></label>
      <label>Author <input value={form.author} onChange={set('author')} required /></label>
      <label>ISBN <input value={form.isbn} onChange={set('isbn')} required /></label>
      <label>Year <input type="number" value={form.year} onChange={set('year')} required /></label>
      <label>Genre <input value={form.genre} onChange={set('genre')} required /></label>
      <label>Price <input type="number" step="0.01" value={form.price} onChange={set('price')} required /></label>
      <label className="checkbox-label">
        <input type="checkbox" checked={form.inStock} onChange={set('inStock')} />
        In Stock
      </label>
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
