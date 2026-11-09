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
  basePath: 'http://localhost:3000',
});

const booksApi = new BooksApi(configuration);
const warehouseApi = new WarehouseApi(configuration);
const ordersApi = new OrdersApi(configuration);

async function listBooks(filters?: Filter[]): Promise<Book[]> {
  const request: {
    name?: string;
    author?: string;
    priceFrom?: number;
    priceTo?: number;
  } = {};

  if (filters) {
    for (const filter of filters) {
      if (filter.name !== undefined) {
        request.name = filter.name;
      }

      if (filter.author !== undefined) {
        request.author = filter.author;
      }

      if (filter.from !== undefined) {
        request.priceFrom = filter.from;
      }

      if (filter.to !== undefined) {
        request.priceTo = filter.to;
      }
    }
  }

  return await booksApi.listBooks(request);
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

const assignment = 'assignment-5';

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
