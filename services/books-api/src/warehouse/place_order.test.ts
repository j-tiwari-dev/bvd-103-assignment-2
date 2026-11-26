import { describe, expect, test } from 'vitest';
import { InMemoryWarehouse } from './warehouse_data';
import { placeOrder } from './place_order';

describe('placeOrder', () => {
  test('places an order when all book IDs are valid', async () => {
    const warehouse = new InMemoryWarehouse();

    const bookExists = async (bookId: string): Promise<boolean> => {
      return bookId === 'book-1' || bookId === 'book-2';
    };

    const result = await placeOrder(
      {
        'book-1': 2,
        'book-2': 1,
      },
      warehouse,
      bookExists
    );

    expect(result.orderId).toBeDefined();

    const order = await warehouse.getOrder(result.orderId);

    expect(order).toEqual({
      'book-1': 2,
      'book-2': 1,
    });
  });

  test('rejects an order when a book ID does not exist', async () => {
    const warehouse = new InMemoryWarehouse();

    const bookExists = async (): Promise<boolean> => false;

    await expect(
      placeOrder(
        {
          'invalid-book': 2,
        },
        warehouse,
        bookExists
      )
    ).rejects.toThrow('Book not found');

    const orders = await warehouse.listOrders();

    expect(orders).toEqual([]);
  });

  test('allows an order when the book has no warehouse stock', async () => {
    const warehouse = new InMemoryWarehouse();

    const bookExists = async (): Promise<boolean> => true;

    const result = await placeOrder(
      {
        'book-1': 3,
      },
      warehouse,
      bookExists
    );

    expect(result.orderId).toBeDefined();

    const stock = await warehouse.getCopies('book-1');

    expect(stock).toEqual({});
  });
});
