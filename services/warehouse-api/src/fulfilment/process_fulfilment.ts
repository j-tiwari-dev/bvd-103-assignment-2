import { randomUUID } from 'node:crypto';
import { getDatabase } from '../db';

export interface FulfilmentItem {
  book: string;
  shelf: string;
  numberOfBooks: number;
}

interface StockDocument {
  bookId: string;
  shelf: string;
  count: number;
}

interface FulfilmentRecord {
  _id: string;
  status: 'fulfilled';
  processedAt: Date;
}

export async function processFulfilment(
  orderId: string,
  items: FulfilmentItem[]
): Promise<void> {
  if (!orderId || !Array.isArray(items) || items.length === 0) {
    throw new Error('Invalid fulfilment request');
  }

  const totals = new Map<string, FulfilmentItem>();

  for (const item of items) {
    if (
      !item ||
      typeof item.book !== 'string' ||
      !item.book.trim() ||
      typeof item.shelf !== 'string' ||
      !item.shelf.trim() ||
      !Number.isSafeInteger(item.numberOfBooks) ||
      item.numberOfBooks <= 0
    ) {
      throw new Error('Invalid fulfilment item');
    }

    const key = JSON.stringify([item.book, item.shelf]);
    const existing = totals.get(key);

    const total = (existing?.numberOfBooks ?? 0) + item.numberOfBooks;

    if (!Number.isSafeInteger(total)) {
      throw new Error('Invalid fulfilment quantity');
    }

    totals.set(key, {
      ...item,
      numberOfBooks: total,
    });
  }

  const database = getDatabase();
  const session = database.client.startSession();

  try {
    await session.withTransaction(async () => {
      const fulfilments = database.collection<FulfilmentRecord>('fulfilments');

      const existing = await fulfilments.findOne({ _id: orderId }, { session });

      if (existing) {
        return;
      }

      const inventory = database.collection<StockDocument>('books');

      for (const item of totals.values()) {
        const result = await inventory.updateOne(
          {
            bookId: item.book,
            shelf: item.shelf,
            count: {
              $gte: item.numberOfBooks,
            },
          },
          {
            $inc: {
              count: -item.numberOfBooks,
            },
          },
          { session }
        );

        if (result.matchedCount !== 1) {
          throw new Error('Not enough stock');
        }
      }

      await fulfilments.insertOne(
        {
          _id: orderId,
          status: 'fulfilled',
          processedAt: new Date(),
        },
        { session }
      );

      // Publish updated stock totals after successful fulfilment.
      const affectedBooks = new Set(items.map((item) => item.book));

      for (const bookId of affectedBooks) {
        const shelves = await inventory.find({ bookId }, { session }).toArray();

        const stock = shelves.reduce((total, shelf) => total + shelf.count, 0);

        await database.collection('outbox').insertOne(
          {
            eventId: randomUUID(),
            type: 'BookStocked',
            timestamp: new Date().toISOString(),
            data: { bookId, stock },
            published: false,
          },
          { session }
        );
      }

      await database.collection('outbox').insertOne(
        {
          eventId: randomUUID(),
          type: 'OrderFulfilled',
          timestamp: new Date().toISOString(),
          data: { orderId },
          published: false,
        },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
}
