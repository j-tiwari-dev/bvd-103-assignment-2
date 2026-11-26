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
    // Only nonzero whole-number adjustments are allowed.
    if (!Number.isSafeInteger(count) || count === 0) {
      throw new Error('Invalid shelf quantity');
    }

    // Validate book and shelf identifiers.
    if (
      typeof bookId !== 'string' ||
      typeof shelf !== 'string' ||
      !bookId.trim() ||
      !shelf.trim()
    ) {
      throw new Error('Invalid book or shelf');
    }

    const currentCount = this.books[bookId]?.[shelf] ?? 0;
    const newCount = currentCount + count;

    // Prevent inventory from becoming negative.
    if (newCount < 0) {
      throw new Error('Not enough stock');
    }

    // Prevent unsafe integer values.
    if (!Number.isSafeInteger(newCount)) {
      throw new Error('Invalid shelf quantity');
    }

    if (!this.books[bookId]) {
      this.books[bookId] = {};
    }

    this.books[bookId][shelf] = newCount;
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
