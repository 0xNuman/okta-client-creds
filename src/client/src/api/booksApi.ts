export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  year: number;
  genre: string;
  price: number;
  inStock: boolean;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  year: number;
  genre: string;
  price: number;
  inStock: boolean;
}

async function authFetch(accessToken: string, input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const booksApi = {
  getAll: (token: string): Promise<Book[]> =>
    authFetch(token, '/api/books'),

  getById: (token: string, id: string): Promise<Book> =>
    authFetch(token, `/api/books/${id}`),

  create: (token: string, book: CreateBookRequest): Promise<Book> =>
    authFetch(token, '/api/books', { method: 'POST', body: JSON.stringify(book) }),

  update: (token: string, id: string, book: CreateBookRequest): Promise<Book> =>
    authFetch(token, `/api/books/${id}`, { method: 'PUT', body: JSON.stringify(book) }),

  delete: (token: string, id: string): Promise<null> =>
    authFetch(token, `/api/books/${id}`, { method: 'DELETE' }),
};
