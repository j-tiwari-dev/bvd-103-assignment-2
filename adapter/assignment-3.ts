// Define the shape of a single Book
export interface Book {
  id?: string;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

// A simple, single object for all filters. This implies AND logic.
export interface BookFilters {
  name?: string;
  author?: string;
  priceFrom?: number;
  priceTo?: number;
}

const API_BASE = 'http://localhost:3000';

// listBooks takes a single optional filters object
export async function listBooks(filters?: BookFilters): Promise<Book[]> {
  const query = new URLSearchParams();

  // Build the query string from the filters object
  if (filters) {
    if (filters.name) query.append('name', filters.name);
    if (filters.author) query.append('author', filters.author);
    if (filters.priceFrom)
      query.append('priceFrom', filters.priceFrom.toString());
    if (filters.priceTo) query.append('priceTo', filters.priceTo.toString());
  }

  const response = await fetch(`${API_BASE}/books?${query.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch books from the API');
  }
  return (await response.json()) as Book[];
}

// We still need the other functions to make the site work
export async function createOrUpdateBook(book: Book): Promise<string> {
  const method = book.id ? 'PUT' : 'POST';
  const response = await fetch(`${API_BASE}/books`, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  });
  if (!response.ok) {
    throw new Error('Failed to save the book');
  }

  // FIX: Assert the type of the result to be an object with an 'id' property
  const result = (await response.json()) as { id: string };

  return result.id;
}

export async function removeBook(bookId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/books/${bookId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete the book');
  }
}

const assignment = 'assignment-3';

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
};
