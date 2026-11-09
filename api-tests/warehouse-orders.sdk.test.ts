import { describe, expect, test } from 'vitest';
import {
  BooksApi,
  Configuration,
  OrdersApi,
  WarehouseApi,
} from '../generated-client';

const configuration = new Configuration({
  basePath: 'http://localhost:3000',
});

const booksApi = new BooksApi(configuration);
const warehouseApi = new WarehouseApi(configuration);
const ordersApi = new OrdersApi(configuration);

describe('Warehouse and Orders generated SDK', () => {
  test('places stock, creates an order, fulfils it, and reduces stock', async () => {
    // Get a real book ID from the API.
    const books = await booksApi.listBooks();

    expect(books.length).toBeGreaterThan(0);

    const bookId = books[0].id;
    const shelf = `sdk-test-${Date.now()}`;

    // Put 5 copies onto a unique shelf.
    await warehouseApi.placeBooksOnShelf({
      placeBooksRequest: {
        bookId,
        numberOfBooks: 5,
        shelf,
      },
    });

    // Confirm the shelf contains 5 copies.
    const shelvesBefore = await warehouseApi.findBookOnShelf({
      bookId,
    });

    const testShelfBefore = shelvesBefore.find((item) => item.shelf === shelf);

    expect(testShelfBefore).toBeDefined();
    expect(testShelfBefore?.count).toBe(5);

    // Create an order for 2 copies.
    const createdOrder = await ordersApi.createOrder({
      placeOrderRequest: {
        books: {
          [bookId]: 2,
        },
      },
    });

    expect(createdOrder.orderId).toBeDefined();

    // Confirm the new order appears in the order list.
    const ordersBefore = await ordersApi.listOrders();

    const orderBefore = ordersBefore.find(
      (order) => order.orderId === createdOrder.orderId
    );

    expect(orderBefore).toBeDefined();
    expect(orderBefore?.books[bookId]).toBe(2);

    // Fulfil the order using 2 copies from the test shelf.
    await ordersApi.fulfilOrder({
      orderId: createdOrder.orderId,
      fulfilOrderRequest: {
        booksFulfilled: [
          {
            book: bookId,
            shelf,
            numberOfBooks: 2,
          },
        ],
      },
    });

    // Stock on the shelf should now be 3.
    const shelvesAfter = await warehouseApi.findBookOnShelf({
      bookId,
    });

    const testShelfAfter = shelvesAfter.find((item) => item.shelf === shelf);

    expect(testShelfAfter).toBeDefined();
    expect(testShelfAfter?.count).toBe(3);

    // Fulfilled order should no longer be outstanding.
    const ordersAfter = await ordersApi.listOrders();

    const completedOrder = ordersAfter.find(
      (order) => order.orderId === createdOrder.orderId
    );

    expect(completedOrder).toBeUndefined();

    // Book's total stock should also reflect the warehouse change.
    const book = await booksApi.getBookById({
      id: bookId,
    });

    expect(book.stock).toBeGreaterThanOrEqual(3);
  });
});
