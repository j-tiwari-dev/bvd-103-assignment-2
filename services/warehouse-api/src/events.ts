import { randomUUID } from 'node:crypto';
import { getDatabase } from './db';
import {
  RabbitMQClient,
  type DomainEvent,
} from '../../shared/messaging/rabbitmq';

export const rabbitmq = new RabbitMQClient();

interface BookEventData {
  id: string;
  name?: string;
  author?: string;
}

interface StockEventData {
  bookId: string;
  stock: number;
}

export async function subscribeToBookEvents(): Promise<void> {
  await rabbitmq.subscribe(
    'warehouse.book-events',
    ['BookAdded', 'BookUpdated', 'BookDeleted'],
    async (event: DomainEvent) => {
      const data = event.data as BookEventData;

      if (!data || typeof data.id !== 'string') {
        throw new Error('Invalid book event');
      }

      const collection = getDatabase().collection('book_catalog');

      if (event.type === 'BookDeleted') {
        await collection.deleteOne({ bookId: data.id });
        return;
      }

      await collection.updateOne(
        { bookId: data.id },
        {
          $set: {
            bookId: data.id,
            name: data.name ?? '',
            author: data.author ?? '',
          },
        },
        { upsert: true }
      );
    }
  );
}

export async function publishBookStocked(
  bookId: string,
  stock: number
): Promise<void> {
  const event: DomainEvent<StockEventData> = {
    eventId: randomUUID(),
    type: 'BookStocked',
    timestamp: new Date().toISOString(),
    data: { bookId, stock },
  };

  await rabbitmq.publish(event);
}
