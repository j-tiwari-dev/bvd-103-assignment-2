import { type Db } from 'mongodb';

import {
  type BookID,
  type OrderId,
  type ShelfId,
  type WarehouseData,
} from './warehouse_data';

interface WarehouseBookDocument {
  bookId: BookID;

  shelf: ShelfId;

  count: number;
}

interface WarehouseOrderDocument {
  orderId: OrderId;

  books: Record<BookID, number>;
}

export class DatabaseWarehouse implements WarehouseData {
  constructor(private readonly database: Db) {}

  async placeBookOnShelf(
    bookId: BookID,

    shelf: ShelfId,

    count: number
  ): Promise<void> {
    if (!Number.isSafeInteger(count) || count === 0) {
      throw new Error('Invalid shelf quantity');
    }

    if (
      typeof bookId !== 'string' ||
      typeof shelf !== 'string' ||
      !bookId.trim() ||
      !shelf.trim()
    ) {
      throw new Error('Invalid book or shelf');
    }

    const collection = this.database.collection<WarehouseBookDocument>('books');

    if (count > 0) {
      await collection.updateOne(
        {
          bookId,

          shelf,
        },

        {
          $inc: {
            count,
          },
        },

        {
          upsert: true,
        }
      );

      return;
    }

    const quantityToRemove = Math.abs(count);

    /*

     * The count condition and deduction happen in one MongoDB operation.

     * This prevents concurrent backend instances from reducing stock

     * below zero.

     */

    const result = await collection.updateOne(
      {
        bookId,

        shelf,

        count: {
          $gte: quantityToRemove,
        },
      },

      {
        $inc: {
          count,
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Not enough stock');
    }
  }

  async getCopiesOnShelf(
    bookId: BookID,

    shelf: ShelfId
  ): Promise<number> {
    const book = await this.database

      .collection<WarehouseBookDocument>('books')

      .findOne({
        bookId,

        shelf,
      });

    return book?.count ?? 0;
  }

  async getCopies(bookId: BookID): Promise<Record<ShelfId, number>> {
    const books = await this.database

      .collection<WarehouseBookDocument>('books')

      .find({
        bookId,
      })

      .toArray();

    return books.reduce<Record<ShelfId, number>>(
      (copies, book) => {
        copies[book.shelf] = book.count;

        return copies;
      },

      {}
    );
  }

  async getOrder(orderId: OrderId): Promise<Record<BookID, number> | false> {
    const order = await this.database

      .collection<WarehouseOrderDocument>('orders')

      .findOne({
        orderId,
      });

    return order?.books ?? false;
  }

  async placeOrder(books: Record<BookID, number>): Promise<OrderId> {
    const orderId = crypto.randomUUID();

    await this.database

      .collection<WarehouseOrderDocument>('orders')

      .insertOne({
        orderId,

        books: { ...books },
      });

    return orderId;
  }

  async listOrders(): Promise<
    Array<{
      orderId: OrderId;

      books: Record<BookID, number>;
    }>
  > {
    const orders = await this.database

      .collection<WarehouseOrderDocument>('orders')

      .find({})

      .toArray();

    return orders.map((order) => ({
      orderId: order.orderId,

      books: { ...order.books },
    }));
  }

  async removeOrder(orderId: OrderId): Promise<void> {
    await this.database

      .collection<WarehouseOrderDocument>('orders')

      .deleteOne({
        orderId,
      });
  }
}
