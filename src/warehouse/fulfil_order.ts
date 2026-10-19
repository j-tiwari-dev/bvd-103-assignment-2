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

  // Check that enough stock exists before changing anything.
  for (const item of booksFulfilled) {
    const available = await warehouse.getCopiesOnShelf(item.book, item.shelf);

    if (available < item.numberOfBooks) {
      throw new Error('Not enough stock');
    }
  }

  // Verify the supplied books satisfy the quantities in the order.
  for (const [bookId, requiredCount] of Object.entries(order)) {
    const suppliedCount = booksFulfilled
      .filter((item) => item.book === bookId)
      .reduce((total, item) => total + item.numberOfBooks, 0);

    if (suppliedCount < requiredCount) {
      throw new Error('Order is not fully fulfilled');
    }

    if (suppliedCount > requiredCount) {
      throw new Error('Too many books supplied');
    }
  }

  // Remove the fulfilled copies from their shelves.
  for (const item of booksFulfilled) {
    await warehouse.placeBookOnShelf(
      item.book,
      item.shelf,
      -item.numberOfBooks
    );
  }

  await warehouse.removeOrder(orderId);
}
