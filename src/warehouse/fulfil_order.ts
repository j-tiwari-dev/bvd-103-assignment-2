import {
  type BookID,
  type OrderId,
  type ShelfId,
  type WarehouseData,
} from './warehouse_data';

export interface FulfilledBook {
  book: BookID;
  shelf: ShelfId;
  numberOfBooks: number;
}

export async function fulfilOrder(
  orderId: OrderId,
  booksFulfilled: FulfilledBook[],
  warehouse: WarehouseData
): Promise<void> {
  const order = await warehouse.getOrder(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  // Validate all quantities before changing inventory.
  for (const item of booksFulfilled) {
    if (!Number.isSafeInteger(item.numberOfBooks) || item.numberOfBooks <= 0) {
      throw new Error('Invalid fulfilment quantity');
    }

    if (!item.book || !item.shelf) {
      throw new Error('Invalid book or shelf');
    }
  }

  // Aggregate quantities by book and shelf.
  const shelfTotals = new Map<string, number>();
  const orderTotals = new Map<BookID, number>();

  for (const item of booksFulfilled) {
    const shelfKey = JSON.stringify([item.book, item.shelf]);

    shelfTotals.set(
      shelfKey,
      (shelfTotals.get(shelfKey) ?? 0) + item.numberOfBooks
    );

    orderTotals.set(
      item.book,
      (orderTotals.get(item.book) ?? 0) + item.numberOfBooks
    );
  }

  // Check all shelf totals before removing any stock.
  for (const [shelfKey, required] of shelfTotals) {
    const [bookId, shelf] = JSON.parse(shelfKey) as [BookID, ShelfId];

    const available = await warehouse.getCopiesOnShelf(bookId, shelf);

    if (available < required) {
      throw new Error('Not enough stock');
    }
  }

  // Ensure exact order quantities.
  for (const [bookId, requiredCount] of Object.entries(order)) {
    const suppliedCount = orderTotals.get(bookId) ?? 0;

    if (suppliedCount !== requiredCount) {
      throw new Error('Order quantities do not match');
    }
  }

  // Reject any extra books that are not in the order.
  for (const bookId of orderTotals.keys()) {
    if (!(bookId in order)) {
      throw new Error('Book not in order');
    }
  }

  // All checks passed. Remove stock from shelves.
  for (const item of booksFulfilled) {
    await warehouse.placeBookOnShelf(
      item.book,
      item.shelf,
      -item.numberOfBooks
    );
  }

  // Remove the completed order.
  await warehouse.removeOrder(orderId);
}
