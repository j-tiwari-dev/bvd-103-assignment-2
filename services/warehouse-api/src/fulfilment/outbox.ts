import { getDatabase } from '../db';
import { rabbitmq } from '../events';
import type { DomainEvent } from '../../../shared/messaging/rabbitmq';

interface OutboxRecord extends DomainEvent {
  published: boolean;
}

export async function publishPendingEvents(): Promise<void> {
  const collection = getDatabase().collection<OutboxRecord>('outbox');

  const pending = await collection
    .find({ published: false })
    .limit(100)
    .toArray();

  for (const event of pending) {
    await rabbitmq.publish({
      eventId: event.eventId,
      type: event.type,
      timestamp: event.timestamp,
      data: event.data,
    });

    await collection.updateOne(
      { _id: event._id },
      { $set: { published: true } }
    );
  }
}

export function startOutboxPublisher(): () => void {
  const timer = setInterval(() => {
    void publishPendingEvents().catch((error: unknown) => {
      console.error('Outbox publishing failed:', error);
    });
  }, 3000);

  return () => clearInterval(timer);
}
