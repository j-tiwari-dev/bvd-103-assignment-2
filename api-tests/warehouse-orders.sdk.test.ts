import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  BooksApi,
  Configuration,
  OrdersApi,
  WarehouseApi,
} from '../generated-client';
import { createTestBook, removeTestBook, type TestBook } from './test_data';

const configuration = new Configuration({
  basePath: 'http://localhost:3000',
});

const booksApi = new BooksApi(configuration);
const warehouseApi = new WarehouseApi(configuration);
const ordersApi = new OrdersApi(configuration);

describe('Warehouse and Orders generated SDK', () => {
  let testBook: TestBook;

  beforeAll(async () => {
    testBook = await createTestBook();
  });

  afterAll(async () => {
    await removeTestBook(testBook.objectId);
  });

  test('places stock, creates an order, fulfils it, and reduces stock', async () => {
    const shelf = `sdk-test-${Date.now()}`;

    await warehouseApi.placeBooksOnShelf({
      placeBooksRequest: {
        bookId: testBook.id,
        numberOfBooks: 5,
        shelf,
      },
    });

    const shelvesBefore = await warehouseApi.findBookOnShelf({
      bookId: testBook.id,
    });

    const testShelfBefore = shelvesBefore.find((item) => item.shelf === shelf);

    expect(testShelfBefore?.count).toBe(5);

    const createdOrder = await ordersApi.createOrder({
      placeOrderRequest: {
        books: {
          [testBook.id]: 2,
        },
      },
    });

    const ordersBefore = await ordersApi.listOrders();

    const orderBefore = ordersBefore.find(
      (order) => order.orderId === createdOrder.orderId
    );

    expect(orderBefore).toBeDefined();
    expect(orderBefore?.books[testBook.id]).toBe(2);

    await ordersApi.fulfilOrder({
      orderId: createdOrder.orderId,
      fulfilOrderRequest: {
        booksFulfilled: [
          {
            book: testBook.id,
            shelf,
            numberOfBooks: 2,
          },
        ],
      },
    });

    const shelvesAfter = await warehouseApi.findBookOnShelf({
      bookId: testBook.id,
    });

    const testShelfAfter = shelvesAfter.find((item) => item.shelf === shelf);

    expect(testShelfAfter?.count).toBe(3);

    const ordersAfter = await ordersApi.listOrders();

    expect(
      ordersAfter.find((order) => order.orderId === createdOrder.orderId)
    ).toBeUndefined();

    const book = await booksApi.getBookById({
      id: testBook.id,
    });

    expect(book.stock).toBe(3);
  });
});
