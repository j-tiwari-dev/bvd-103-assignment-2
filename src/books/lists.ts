import Router from '@koa/router';
import { type Document } from 'mongodb';
import { getDatabase } from '../db';
import { DatabaseWarehouse } from '../warehouse/warehouse_database';

const listRouter = new Router();

function getWarehouse(): DatabaseWarehouse {
  const bookDatabase = getDatabase();
  const warehouseDatabase = bookDatabase.client.db('mcmasterful-warehouse');

  return new DatabaseWarehouse(warehouseDatabase);
}

function calculateTotalStock(copies: Record<string, number>): number {
  return Object.values(copies).reduce((total, count) => total + count, 0);
}

listRouter.get('/books', async (ctx) => {
  try {
    const db = getDatabase();
    const warehouse = getWarehouse();

    const { name, author, priceFrom, priceTo } = ctx.query;

    const query: Document = {};
    const priceQuery: Document = {};

    if (typeof name === 'string') {
      query.name = {
        $regex: name,
        $options: 'i',
      };
    }

    if (typeof author === 'string') {
      query.author = {
        $regex: author,
        $options: 'i',
      };
    }

    if (
      typeof priceFrom === 'string' &&
      !Number.isNaN(Number.parseFloat(priceFrom))
    ) {
      priceQuery.$gte = Number.parseFloat(priceFrom);
    }

    if (
      typeof priceTo === 'string' &&
      !Number.isNaN(Number.parseFloat(priceTo))
    ) {
      priceQuery.$lte = Number.parseFloat(priceTo);
    }

    if (Object.keys(priceQuery).length > 0) {
      query.price = priceQuery;
    }

    const books = await db.collection('books').find(query).toArray();

    const formattedBooks = await Promise.all(
      books.map(async (book) => {
        const id = book._id.toString();
        const copies = await warehouse.getCopies(id);
        const stock = calculateTotalStock(copies);

        return {
          ...book,
          id,
          stock,
        };
      })
    );

    ctx.status = 200;
    ctx.body = formattedBooks;
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: 'Failed to fetch books',
    };

    console.error(error);
  }
});

export default listRouter;
