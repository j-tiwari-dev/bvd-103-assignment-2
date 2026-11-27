import { getDatabase } from './db';
import { updateOrderStatus } from './orders/order_repository';
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

export async function subscribeToBookEvents(): Promise<void> {
  await rabbitmq.subscribe(
    'orders.book-events',
    ['BookAdded', 'BookUpdated', 'BookDeleted'],
    async (event: DomainEvent) => {
      const data = event.data as BookEventData;

      if (!data || typeof data.id !== 'string' || !data.id) {
        throw new Error('Invalid book event');
      }

      const collection = getDatabase().collection('valid_books');

      if (event.type === 'BookDeleted') {
        await collection.deleteOne({
          bookId: data.id,
        });
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

export interface FulfilmentItem {
  book: string;
  shelf: string;
  numberOfBooks: number;
}

export async function publishFulfilmentRequest(
  orderId: string,
  booksFulfilled: FulfilmentItem[]
): Promise<void> {
  const event: DomainEvent<{
    orderId: string;
    booksFulfilled: FulfilmentItem[];
  }> = {
    eventId: crypto.randomUUID(),
    type: 'OrderFulfilmentRequested',
    timestamp: new Date().toISOString(),
    data: {
      orderId,
      booksFulfilled,
    },
  };

  await rabbitmq.publish(event);
}

export async function subscribeToFulfilmentResults(): Promise<void> {
  await rabbitmq.subscribe(
    'orders.fulfilment-results',
    ['OrderFulfilled', 'OrderFulfilmentFailed'],
    async (event: DomainEvent) => {
      const data = event.data as {
        orderId: string;
        reason?: string;
      };

      if (!data || typeof data.orderId !== 'string') {
        throw new Error('Invalid fulfilment result');
      }

      if (event.type === 'OrderFulfilled') {
        await updateOrderStatus(data.orderId, 'fulfilled');
      }

      if (event.type === 'OrderFulfilmentFailed') {
        await updateOrderStatus(
          data.orderId,
          'failed',
          data.reason ?? 'Fulfilment failed'
        );
      }
    }
  );
}
