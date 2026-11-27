import { ObjectId } from 'mongodb';
import { getDatabase } from './db';
import { randomUUID } from 'node:crypto';

import {
  RabbitMQClient,
  type DomainEvent,
} from '../../shared/messaging/rabbitmq';

export const rabbitmq = new RabbitMQClient();

export type BookEventType = 'BookAdded' | 'BookUpdated' | 'BookDeleted';

export interface BookEventData {
  id: string;
  name?: string;
  author?: string;
  description?: string;
  price?: number;
  image?: string;
}

export async function publishBookEvent(
  type: BookEventType,
  data: BookEventData
): Promise<void> {
  const event: DomainEvent<BookEventData> = {
    eventId: randomUUID(),
    type,
    timestamp: new Date().toISOString(),
    data,
  };

  await rabbitmq.publish(event);
}

export async function subscribeToStockEvents(): Promise<void> {
  await rabbitmq.subscribe(
    'books.stock-events',
    ['BookStocked'],
    async (event: DomainEvent) => {
      const data = event.data as {
        bookId: string;
        stock: number;
      };

      if (
        !data ||
        typeof data.bookId !== 'string' ||
        !ObjectId.isValid(data.bookId) ||
        !Number.isSafeInteger(data.stock) ||
        data.stock < 0
      ) {
        throw new Error('Invalid BookStocked event');
      }

      await getDatabase()
        .collection('books')
        .updateOne(
          { _id: new ObjectId(data.bookId) },
          { $set: { stock: data.stock } }
        );
    }
  );
}
