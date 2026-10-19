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
    await this.database.collection<WarehouseBookDocument>('books').updateOne(
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
  }

  async getCopiesOnShelf(bookId: BookID, shelf: ShelfId): Promise<number> {
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

    return books.reduce<Record<ShelfId, number>>((copies, book) => {
      copies[book.shelf] = book.count;
      return copies;
    }, {});
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

    await this.database.collection<WarehouseOrderDocument>('orders').insertOne({
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
      books: order.books,
    }));
  }

  async removeOrder(orderId: OrderId): Promise<void> {
    await this.database.collection<WarehouseOrderDocument>('orders').deleteOne({
      orderId,
    });
  }
}
