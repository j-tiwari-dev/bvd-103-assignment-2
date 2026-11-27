import { randomUUID } from 'node:crypto';
import { getDatabase } from '../db';
import { rabbitmq } from '../events';
import { processFulfilment, type FulfilmentItem } from './process_fulfilment';
import type { DomainEvent } from '../../../shared/messaging/rabbitmq';

interface FulfilmentRequest {
  orderId: string;
  booksFulfilled: FulfilmentItem[];
}

export async function subscribeToFulfilmentRequests(): Promise<void> {
  await rabbitmq.subscribe(
    'warehouse.fulfilment-requests',
    ['OrderFulfilmentRequested'],
    async (event: DomainEvent) => {
      const request = event.data as FulfilmentRequest;

      if (
        !request ||
        typeof request.orderId !== 'string' ||
        !request.orderId.trim() ||
        !Array.isArray(request.booksFulfilled)
      ) {
        throw new Error('Invalid fulfilment request event');
      }

      try {
        await processFulfilment(request.orderId, request.booksFulfilled);
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }

        const validationErrors = [
          'Invalid fulfilment request',
          'Invalid fulfilment item',
          'Invalid fulfilment quantity',
          'Not enough stock',
        ];

        if (!validationErrors.includes(error.message)) {
          throw error;
        }

        await getDatabase()
          .collection('outbox')
          .updateOne(
            {
              type: 'OrderFulfilmentFailed',
              'data.orderId': request.orderId,
            },
            {
              $setOnInsert: {
                eventId: randomUUID(),
                type: 'OrderFulfilmentFailed',
                timestamp: new Date().toISOString(),
                data: {
                  orderId: request.orderId,
                  reason: error.message,
                },
                published: false,
              },
            },
            { upsert: true }
          );
      }
    }
  );
}
