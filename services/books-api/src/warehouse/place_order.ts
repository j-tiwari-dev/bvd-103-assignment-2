import {
  type BookID,
  type OrderId,
  type WarehouseData,
} from './warehouse_data';

export type BookExists = (bookId: BookID) => Promise<boolean>;

export async function placeOrder(
  books: Record<BookID, number>,
  warehouse: WarehouseData,
  bookExists: BookExists
): Promise<{ orderId: OrderId }> {
  for (const [bookId, quantity] of Object.entries(books)) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Invalid book quantity');
    }

    const exists = await bookExists(bookId);

    if (!exists) {
      throw new Error('Book not found');
    }
  }

  const orderId = await warehouse.placeOrder(books);

  return { orderId };
}
