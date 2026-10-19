import previous_assignment from './assignment-3';

export type BookID = string;

export interface Book {
  id?: BookID;

  name: string;

  author: string;

  description: string;

  price: number;

  image: string;

  stock?: number;
}

export interface Filter {
  from?: number;

  to?: number;

  name?: string;

  author?: string;
}

export type ShelfId = string;

export type OrderId = string;

const API_BASE = 'http://localhost:3000';

async function listBooks(filters?: Filter[]): Promise<Book[]> {
  const query = new URLSearchParams();

  if (filters) {
    for (const filter of filters) {
      if (filter.name) {
        query.set('name', filter.name);
      }

      if (filter.author) {
        query.set('author', filter.author);
      }

      if (filter.from !== undefined) {
        query.set('priceFrom', filter.from.toString());
      }

      if (filter.to !== undefined) {
        query.set('priceTo', filter.to.toString());
      }
    }
  }

  const response = await fetch(`${API_BASE}/books?${query.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  return (await response.json()) as Book[];
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
  return await previous_assignment.createOrUpdateBook(book);
}

async function removeBook(book: BookID): Promise<void> {
  await previous_assignment.removeBook(book);
}

async function lookupBookById(book: BookID): Promise<Book> {
  const response = await fetch(`${API_BASE}/books/${book}`);

  if (!response.ok) {
    throw new Error('Book not found');
  }

  return (await response.json()) as Book;
}

async function placeBooksOnShelf(
  bookId: BookID,

  numberOfBooks: number,

  shelf: ShelfId
): Promise<void> {
  const response = await fetch(`${API_BASE}/warehouse/shelves`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      bookId,

      numberOfBooks,

      shelf,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to place books on shelf');
  }
}

async function orderBooks(order: BookID[]): Promise<{ orderId: OrderId }> {
  const books: Record<BookID, number> = {};

  for (const bookId of order) {
    books[bookId] = (books[bookId] ?? 0) + 1;
  }

  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      books,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to place order');
  }

  return (await response.json()) as {
    orderId: OrderId;
  };
}

async function findBookOnShelf(
  book: BookID
): Promise<Array<{ shelf: ShelfId; count: number }>> {
  const response = await fetch(`${API_BASE}/warehouse/books/${book}`);

  if (!response.ok) {
    throw new Error('Failed to find book in warehouse');
  }

  return (await response.json()) as Array<{
    shelf: ShelfId;

    count: number;
  }>;
}

async function fulfilOrder(
  order: OrderId,

  booksFulfilled: Array<{
    book: BookID;

    shelf: ShelfId;

    numberOfBooks: number;
  }>
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/orders/${order}/fulfil`,

    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        booksFulfilled,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fulfil order');
  }
}

async function listOrders(): Promise<
  Array<{
    orderId: OrderId;

    books: Record<BookID, number>;
  }>
> {
  const response = await fetch(`${API_BASE}/orders`);

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return (await response.json()) as Array<{
    orderId: OrderId;

    books: Record<BookID, number>;
  }>;
}

const assignment = 'assignment-4';

export default {
  assignment,

  createOrUpdateBook,

  removeBook,

  listBooks,

  placeBooksOnShelf,

  orderBooks,

  findBookOnShelf,

  fulfilOrder,

  listOrders,

  lookupBookById,
};
