import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  BooksApi,
  Configuration,
  OrdersApi,
  WarehouseApi,
} from '../generated-client';
import { createTestBook, removeTestBook, type TestBook } from './test_data';

const configuration = new Configuration({
  basePath: process.env.API_BASE_URL ?? 'http://localhost:8081/api',
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
    if (testBook) {
      await removeTestBook(testBook.id);
    }
  });

  test('places stock, creates an order, fulfils it, and reduces stock', async () => {
    const shelf = `sdk-test-${crypto.randomUUID()}`;

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

    expect(createdOrder.orderId).toBeDefined();

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

    // Wait for asynchronous RabbitMQ fulfilment.
    await expect
      .poll(
        async () => {
          const orders = await ordersApi.listOrders();
          return orders.find((order) => order.orderId === createdOrder.orderId)
            ?.status;
        },
        { timeout: 30000, interval: 1000 }
      )
      .toBe('fulfilled');

    await expect
      .poll(
        async () => {
          const shelves = await warehouseApi.findBookOnShelf({
            bookId: testBook.id,
          });
          return shelves.find((item) => item.shelf === shelf)?.count;
        },
        { timeout: 30000, interval: 1000 }
      )
      .toBe(3);

    await expect
      .poll(
        async () => {
          const book = await booksApi.getBookById({
            id: testBook.id,
          });
          return book.stock;
        },
        { timeout: 30000, interval: 1000 }
      )
      .toBe(3);
  });

  test.each([0, -2, 2.5])(
    'rejects invalid shelf quantity %s with HTTP 400',
    async (quantity) => {
      const shelf = `invalid-test-${crypto.randomUUID()}`;

      await expect(
        warehouseApi.placeBooksOnShelf({
          placeBooksRequest: {
            bookId: testBook.id,
            numberOfBooks: quantity,
            shelf,
          },
        })
      ).rejects.toMatchObject({
        response: {
          status: 400,
        },
      });

      const shelves = await warehouseApi.findBookOnShelf({
        bookId: testBook.id,
      });

      expect(shelves.find((item) => item.shelf === shelf)).toBeUndefined();
    }
  );

  test('accepts a valid positive whole-number shelf quantity', async () => {
    const shelf = `valid-test-${crypto.randomUUID()}`;

    await warehouseApi.placeBooksOnShelf({
      placeBooksRequest: {
        bookId: testBook.id,
        numberOfBooks: 5,
        shelf,
      },
    });

    const shelves = await warehouseApi.findBookOnShelf({
      bookId: testBook.id,
    });

    expect(shelves.find((item) => item.shelf === shelf)?.count).toBe(5);
  });
});
