export type BookID = string;
export type ShelfId = string;
export type OrderId = string;

export interface WarehouseData {
  placeBookOnShelf(
    bookId: BookID,
    shelf: ShelfId,
    count: number
  ): Promise<void>;

  getCopiesOnShelf(bookId: BookID, shelf: ShelfId): Promise<number>;

  getCopies(bookId: BookID): Promise<Record<ShelfId, number>>;

  getOrder(order: OrderId): Promise<Record<BookID, number> | false>;

  placeOrder(books: Record<BookID, number>): Promise<OrderId>;

  listOrders(): Promise<
    Array<{
      orderId: OrderId;
      books: Record<BookID, number>;
    }>
  >;

  removeOrder(order: OrderId): Promise<void>;
}

export class InMemoryWarehouse implements WarehouseData {
  books: Record<BookID, Record<ShelfId, number>>;
  orders: Record<OrderId, Record<BookID, number>>;

  constructor() {
    this.books = {};
    this.orders = {};
  }

  async placeBookOnShelf(
    bookId: BookID,
    shelf: ShelfId,
    count: number
  ): Promise<void> {
    if (!this.books[bookId]) {
      this.books[bookId] = {};
    }

    const currentCount = this.books[bookId][shelf] ?? 0;
    this.books[bookId][shelf] = currentCount + count;
  }

  async getCopiesOnShelf(bookId: BookID, shelf: ShelfId): Promise<number> {
    return this.books[bookId]?.[shelf] ?? 0;
  }

  async getCopies(bookId: BookID): Promise<Record<ShelfId, number>> {
    return this.books[bookId] ?? {};
  }

  async getOrder(order: OrderId): Promise<Record<BookID, number> | false> {
    return this.orders[order] ?? false;
  }

  async placeOrder(books: Record<BookID, number>): Promise<OrderId> {
    const orderId = crypto.randomUUID();

    this.orders[orderId] = { ...books };

    return orderId;
  }

  async listOrders(): Promise<
    Array<{
      orderId: OrderId;
      books: Record<BookID, number>;
    }>
  > {
    return Object.entries(this.orders).map(([orderId, books]) => ({
      orderId,
      books: { ...books },
    }));
  }

  async removeOrder(order: OrderId): Promise<void> {
    delete this.orders[order];
  }
}
