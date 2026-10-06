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

async function listBooks(filters?: Filter[]): Promise<Book[]> {
  void filters;
  throw new Error('Todo');
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
  return await previous_assignment.createOrUpdateBook(book);
}

async function removeBook(book: BookID): Promise<void> {
  await previous_assignment.removeBook(book);
}

async function lookupBookById(book: BookID): Promise<Book> {
  void book;
  throw new Error('Todo');
}

export type ShelfId = string;
export type OrderId = string;

async function placeBooksOnShelf(
  bookId: BookID,
  numberOfBooks: number,
  shelf: ShelfId
): Promise<void> {
  void bookId;
  void numberOfBooks;
  void shelf;
  throw new Error('Todo');
}

async function orderBooks(order: BookID[]): Promise<{ orderId: OrderId }> {
  void order;
  throw new Error('Todo');
}

async function findBookOnShelf(
  book: BookID
): Promise<Array<{ shelf: ShelfId; count: number }>> {
  void book;
  throw new Error('Todo');
}

async function fulfilOrder(
  order: OrderId,
  booksFulfilled: Array<{
    book: BookID;
    shelf: ShelfId;
    numberOfBooks: number;
  }>
): Promise<void> {
  void order;
  void booksFulfilled;
  throw new Error('Todo');
}

async function listOrders(): Promise<
  Array<{ orderId: OrderId; books: Record<BookID, number> }>
> {
  throw new Error('Todo');
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
