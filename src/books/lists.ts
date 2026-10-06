import Router from '@koa/router';
import { getDatabase } from '../db';
import { Context } from 'koa';

const listRouter = new Router();

listRouter.get('/books', async (ctx: Context) => {
  try {
    const db = getDatabase();
    const { name, author, priceFrom, priceTo } = ctx.query;

    // Start with an empty query object

    const query: any = {};
    const priceQuery: any = {};

    // Dynamically add filters to the query object if they exist in the URL

    // Add a case-insensitive search for 'name'
    if (typeof name === 'string') {
      query.name = { $regex: name, $options: 'i' };
    }

    // Add a case-insensitive search for 'author'
    if (typeof author === 'string') {
      query.author = { $regex: author, $options: 'i' };
    }

    // Build the price part of the query ($gte = greater than or equal to)
    if (typeof priceFrom === 'string' && !isNaN(parseFloat(priceFrom))) {
      priceQuery.$gte = parseFloat(priceFrom);
    }

    // Build the price part of the query ($lte = less than or equal to)
    if (typeof priceTo === 'string' && !isNaN(parseFloat(priceTo))) {
      priceQuery.$lte = parseFloat(priceTo);
    }

    // If a price filter was added, attach it to the main query
    if (Object.keys(priceQuery).length > 0) {
      query.price = priceQuery;
    }

    // Pass the dynamically built query object to the find() method
    const books = await db.collection('books').find(query).toArray();

    // Format the books for the response
    const formattedBooks = books.map((b) => ({
      ...b,
      id: b._id.toString(),
    }));

    ctx.status = 200;
    ctx.body = formattedBooks;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch books' };
    console.error(error);
  }
});

export default listRouter;
