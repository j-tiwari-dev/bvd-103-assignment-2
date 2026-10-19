import { describe, expect, test } from 'vitest';
import { InMemoryWarehouse } from './warehouse_data';
import { fulfilOrder } from './fulfil_order';

describe('fulfilOrder', () => {
  test('removes fulfilled books from the shelf and completes the order', async () => {
    const warehouse = new InMemoryWarehouse();

    await warehouse.placeBookOnShelf('book-1', 'shelf-a', 5);

    const orderId = await warehouse.placeOrder({
      'book-1': 2,
    });

    await fulfilOrder(
      orderId,
      [
        {
          book: 'book-1',
          shelf: 'shelf-a',
          numberOfBooks: 2,
        },
      ],
      warehouse
    );

    const remainingStock = await warehouse.getCopiesOnShelf(
      'book-1',
      'shelf-a'
    );

    expect(remainingStock).toBe(3);

    const order = await warehouse.getOrder(orderId);

    expect(order).toBe(false);
  });

  test('does not fulfil an order when there is not enough stock', async () => {
    const warehouse = new InMemoryWarehouse();

    await warehouse.placeBookOnShelf('book-1', 'shelf-a', 1);

    const orderId = await warehouse.placeOrder({
      'book-1': 2,
    });

    await expect(
      fulfilOrder(
        orderId,
        [
          {
            book: 'book-1',
            shelf: 'shelf-a',
            numberOfBooks: 2,
          },
        ],
        warehouse
      )
    ).rejects.toThrow('Not enough stock');

    const remainingStock = await warehouse.getCopiesOnShelf(
      'book-1',
      'shelf-a'
    );

    expect(remainingStock).toBe(1);

    const order = await warehouse.getOrder(orderId);

    expect(order).toEqual({
      'book-1': 2,
    });
  });

  test('rejects an order that does not exist', async () => {
    const warehouse = new InMemoryWarehouse();

    await expect(fulfilOrder('unknown-order', [], warehouse)).rejects.toThrow(
      'Order not found'
    );
  });
});
