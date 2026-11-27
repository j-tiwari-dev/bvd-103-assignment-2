import { getDatabase } from '../db';
import { DatabaseWarehouse } from './warehouse_database';

/**
 * Returns the Warehouse API's own MongoDB-backed warehouse.
 */
export function getWarehouse(): DatabaseWarehouse {
  return new DatabaseWarehouse(getDatabase());
}
