import { getDatabase } from '../db';
import { DatabaseWarehouse } from './warehouse_database';

/**
 * Returns the shared MongoDB-backed warehouse.
 */
export function getWarehouse(): DatabaseWarehouse {
  const database = getDatabase();

  const warehouseDatabase = database.client.db('mcmasterful-warehouse');

  return new DatabaseWarehouse(warehouseDatabase);
}
