import { describe, expect, test } from 'vitest';
import { MongoClient } from 'mongodb';
import { InMemoryWarehouse } from './warehouse_data';
import { DatabaseWarehouse } from './warehouse_database';

async function createDatabaseWarehouse(): Promise<{
  warehouse: DatabaseWarehouse;
  client: MongoClient;
}> {
  const uri = (global as any).MONGO_URI as string;

  const client = new MongoClient(uri);
  await client.connect();

  const database = client.db(`warehouse-test-${crypto.randomUUID()}`);

  return {
    warehouse: new DatabaseWarehouse(database),
    client,
  };
}

describe('DatabaseWarehouse', () => {
  test('placing a book behaves like the in-memory warehouse', async () => {
    const memoryWarehouse = new InMemoryWarehouse();

    const { warehouse: databaseWarehouse, client } =
      await createDatabaseWarehouse();

    try {
      await memoryWarehouse.placeBookOnShelf('book-1', 'shelf-a', 5);

      await databaseWarehouse.placeBookOnShelf('book-1', 'shelf-a', 5);

      const memoryResult = await memoryWarehouse.getCopiesOnShelf(
        'book-1',
        'shelf-a'
      );

      const databaseResult = await databaseWarehouse.getCopiesOnShelf(
        'book-1',
        'shelf-a'
      );

      expect(databaseResult).toBe(memoryResult);
      expect(databaseResult).toBe(5);
    } finally {
      await client.close();
    }
  });

  test('supports books on multiple shelves', async () => {
    const { warehouse, client } = await createDatabaseWarehouse();

    try {
      await warehouse.placeBookOnShelf('book-1', 'shelf-a', 5);

      await warehouse.placeBookOnShelf('book-1', 'shelf-b', 3);

      const copies = await warehouse.getCopies('book-1');

      expect(copies).toEqual({
        'shelf-a': 5,
        'shelf-b': 3,
      });
    } finally {
      await client.close();
    }
  });

  test('places and retrieves an order', async () => {
    const { warehouse, client } = await createDatabaseWarehouse();

    try {
      const orderId = await warehouse.placeOrder({
        'book-1': 2,
        'book-2': 1,
      });

      const order = await warehouse.getOrder(orderId);

      expect(order).toEqual({
        'book-1': 2,
        'book-2': 1,
      });
    } finally {
      await client.close();
    }
  });

  test('removes an order', async () => {
    const { warehouse, client } = await createDatabaseWarehouse();

    try {
      const orderId = await warehouse.placeOrder({
        'book-1': 2,
      });

      await warehouse.removeOrder(orderId);

      const order = await warehouse.getOrder(orderId);

      expect(order).toBe(false);
    } finally {
      await client.close();
    }
  });
});
