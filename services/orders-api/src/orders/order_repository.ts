import { randomUUID } from 'node:crypto';
import { getDatabase } from '../db';

export interface OrderDocument {
  orderId: string;
  books: Record<string, number>;
  status: 'pending' | 'fulfilling' | 'fulfilled' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

function getOrders() {
  return getDatabase().collection<OrderDocument>('orders');
}

export async function createOrderRecord(
  books: Record<string, number>
): Promise<{ orderId: string }> {
  const orderId = randomUUID();
  const now = new Date();

  await getOrders().insertOne({
    orderId,
    books: { ...books },
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  });

  return { orderId };
}

export async function listOrderRecords(): Promise<OrderDocument[]> {
  return getOrders().find({}).toArray();
}

export async function getOrderRecord(
  orderId: string
): Promise<OrderDocument | null> {
  return getOrders().findOne({ orderId });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderDocument['status'],
  error?: string
): Promise<void> {
  await getOrders().updateOne(
    { orderId },
    {
      $set: {
        status,
        updatedAt: new Date(),
        ...(error ? { error } : {}),
      },
      ...(!error ? { $unset: { error: '' } } : {}),
    }
  );
}
