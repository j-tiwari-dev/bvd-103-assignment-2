import Router from '@koa/router';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../db';
import { DatabaseWarehouse } from './warehouse_database';
import { fulfilOrder } from './fulfil_order';
import { placeOrder } from './place_order';

const warehouseRouter = new Router();

function getWarehouse(): DatabaseWarehouse {
  const db = getDatabase();

  const warehouseDatabase = db.client.db('mcmasterful-warehouse');

  return new DatabaseWarehouse(warehouseDatabase);
}

warehouseRouter.post('/warehouse/shelves', async (ctx) => {
  const body = ctx.request.body as {
    bookId?: string;
    numberOfBooks?: number;
    shelf?: string;
  };

  if (
    typeof body.bookId !== 'string' ||
    typeof body.shelf !== 'string' ||
    typeof body.numberOfBooks !== 'number' ||
    body.numberOfBooks <= 0
  ) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid shelf placement' };
    return;
  }

  const warehouse = getWarehouse();

  await warehouse.placeBookOnShelf(body.bookId, body.shelf, body.numberOfBooks);

  ctx.status = 204;
});

warehouseRouter.get('/warehouse/books/:bookId', async (ctx) => {
  const { bookId } = ctx.params;

  const warehouse = getWarehouse();

  const copies = await warehouse.getCopies(bookId);

  ctx.status = 200;

  ctx.body = Object.entries(copies).map(([shelf, count]) => ({
    shelf,
    count,
  }));
});

warehouseRouter.post('/orders', async (ctx) => {
  const body = ctx.request.body as {
    books?: Record<string, number>;
  };

  if (
    !body.books ||
    typeof body.books !== 'object' ||
    Array.isArray(body.books)
  ) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid order' };
    return;
  }

  try {
    const warehouse = getWarehouse();

    const result = await placeOrder(body.books, warehouse, async (bookId) => {
      if (!ObjectId.isValid(bookId)) {
        return false;
      }

      const db = getDatabase();

      const book = await db.collection('books').findOne({
        _id: new ObjectId(bookId),
      });

      return book !== null;
    });

    ctx.status = 201;
    ctx.body = result;
  } catch (error) {
    ctx.status = 400;

    ctx.body = {
      error: error instanceof Error ? error.message : 'Failed to place order',
    };
  }
});

warehouseRouter.get('/orders', async (ctx) => {
  const warehouse = getWarehouse();

  const orders = await warehouse.listOrders();

  ctx.status = 200;
  ctx.body = orders;
});

warehouseRouter.post('/orders/:orderId/fulfil', async (ctx) => {
  const { orderId } = ctx.params;

  const body = ctx.request.body as {
    booksFulfilled?: Array<{
      book: string;
      shelf: string;
      numberOfBooks: number;
    }>;
  };

  if (!Array.isArray(body.booksFulfilled)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid fulfilment request' };
    return;
  }

  try {
    const warehouse = getWarehouse();

    await fulfilOrder(orderId, body.booksFulfilled, warehouse);

    ctx.status = 204;
  } catch (error) {
    ctx.status = 400;

    ctx.body = {
      error: error instanceof Error ? error.message : 'Failed to fulfil order',
    };
  }
});

export default warehouseRouter;
