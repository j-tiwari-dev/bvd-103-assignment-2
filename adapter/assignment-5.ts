import {
  BooksApi,
  Configuration,
  OrdersApi,
  WarehouseApi,
} from '../generated-client';

export type BookID = string;
export type ShelfId = string;
export type OrderId = string;

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

const configuration = new Configuration({
  basePath: '/api',
});

const booksApi = new BooksApi(configuration);
const warehouseApi = new WarehouseApi(configuration);
const ordersApi = new OrdersApi(configuration);

async function listBooks(filters?: Filter[]): Promise<Book[]> {
  // No filters: return all books.
  if (!filters || filters.length === 0) {
    return await booksApi.listBooks({});
  }

  // Run a separate SDK request for each filter.
  const results = await Promise.all(
    filters.map((filter) =>
      booksApi.listBooks({
        name: filter.name,
        author: filter.author,
        priceFrom: filter.from,
        priceTo: filter.to,
      })
    )
  );

  // Combine results using OR logic and remove duplicate books.
  const uniqueBooks = new Map<BookID, Book>();

  for (const books of results) {
    for (const book of books) {
      uniqueBooks.set(book.id, book);
    }
  }

  return Array.from(uniqueBooks.values());
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
  const bookInput = {
    name: book.name,
    author: book.author,
    description: book.description,
    price: book.price,
    image: book.image,
  };

  if (book.id) {
    const result = await booksApi.updateBook({
      id: book.id,
      bookInput,
    });

    return result.id;
  }

  const result = await booksApi.createBook({
    bookInput,
  });

  return result.id;
}

async function removeBook(bookId: BookID): Promise<void> {
  await booksApi.deleteBook({
    id: bookId,
  });
}

async function lookupBookById(bookId: BookID): Promise<Book> {
  return await booksApi.getBookById({
    id: bookId,
  });
}

async function placeBooksOnShelf(
  bookId: BookID,
  numberOfBooks: number,
  shelf: ShelfId
): Promise<void> {
  await warehouseApi.placeBooksOnShelf({
    placeBooksRequest: {
      bookId,
      numberOfBooks,
      shelf,
    },
  });
}

async function orderBooks(order: BookID[]): Promise<{ orderId: OrderId }> {
  const books: Record<BookID, number> = {};

  for (const bookId of order) {
    books[bookId] = (books[bookId] ?? 0) + 1;
  }

  return await ordersApi.createOrder({
    placeOrderRequest: {
      books,
    },
  });
}

async function findBookOnShelf(
  bookId: BookID
): Promise<Array<{ shelf: ShelfId; count: number }>> {
  return await warehouseApi.findBookOnShelf({
    bookId,
  });
}

async function fulfilOrder(
  orderId: OrderId,
  booksFulfilled: Array<{
    book: BookID;
    shelf: ShelfId;
    numberOfBooks: number;
  }>
): Promise<void> {
  await ordersApi.fulfilOrder({
    orderId,
    fulfilOrderRequest: {
      booksFulfilled,
    },
  });
}

async function listOrders(): Promise<
  Array<{
    orderId: OrderId;
    books: Record<BookID, number>;
  }>
> {
  return await ordersApi.listOrders();
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
