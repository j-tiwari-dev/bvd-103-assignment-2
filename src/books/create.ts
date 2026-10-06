import Router from '@koa/router';

import { ObjectId } from 'mongodb';

import { getDatabase } from '../db';

const createRouter = new Router();

interface BookInput {
  id?: string;

  name: string;

  author: string;

  description: string;

  price: number;

  image: string;
}

function validateBookInput(body: any): {
  valid: boolean;
  error?: string;
  book?: BookInput;
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, error: 'Request body must be a valid object.' };
  }

  const { id, name, author, description, price, image } = body;

  if (typeof name !== 'string' || name.trim() === '') {
    return {
      valid: false,
      error: 'Book "name" is required and cannot be empty.',
    };
  }

  if (typeof author !== 'string' || author.trim() === '') {
    return {
      valid: false,
      error: 'Book "author" is required and cannot be empty.',
    };
  }

  if (typeof description !== 'string') {
    return { valid: false, error: 'Book "description" must be a string.' };
  }

  if (typeof price !== 'number' || isNaN(price) || price < 0) {
    return {
      valid: false,
      error: 'Book "price" must be a non-negative number.',
    };
  }

  if (typeof image !== 'string') {
    return { valid: false, error: 'Book "image" must be a string.' };
  }

  const book: BookInput = {
    name: name.trim(),

    author: author.trim(),

    description: description.trim(),

    price,

    image: image.trim(),
  };

  if (id !== undefined) {
    book.id = id;
  }

  return { valid: true, book };
}

// Create a new book

createRouter.post('/books', async (ctx) => {
  try {
    const validation = validateBookInput(ctx.request.body);

    if (!validation.valid || !validation.book) {
      ctx.status = 400;

      ctx.body = { error: validation.error };

      return;
    }

    const book = validation.book;

    const db = getDatabase();

    const collection = db.collection('books');

    if (book.id) {
      if (!ObjectId.isValid(book.id)) {
        ctx.status = 400;

        ctx.body = { error: 'Invalid book ID format' };

        return;
      }

      const objectId = new ObjectId(book.id);

      const bookData = { ...book };
      delete bookData.id;

      await collection.updateOne(
        { _id: objectId },

        { $set: bookData },

        { upsert: true }
      );

      ctx.status = 200;

      ctx.body = { id: book.id };
    } else {
      const bookData = { ...book };
      delete bookData.id;

      const result = await collection.insertOne(bookData);

      ctx.status = 201;

      ctx.body = { id: result.insertedId.toString() };
    }
  } catch (error: any) {
    ctx.status = 500;

    ctx.body = { error: `Failed to create book: ${error?.message || error}` };
  }
});

// Update an existing book

createRouter.put('/books/:id', async (ctx) => {
  try {
    const { id } = ctx.params;

    if (!ObjectId.isValid(id)) {
      ctx.status = 400;

      ctx.body = { error: 'Invalid book ID format' };

      return;
    }

    const validation = validateBookInput(ctx.request.body);

    if (!validation.valid || !validation.book) {
      ctx.status = 400;

      ctx.body = { error: validation.error };

      return;
    }

    const bookData = { ...validation.book };
    delete bookData.id;

    const db = getDatabase();

    const result = await db.collection('books').updateOne(
      { _id: new ObjectId(id) },

      { $set: bookData }
    );

    if (result.matchedCount === 0) {
      ctx.status = 404;

      ctx.body = { error: 'Book not found' };

      return;
    }

    ctx.status = 200;

    ctx.body = { id };
  } catch (error: any) {
    ctx.status = 500;

    ctx.body = { error: `Failed to update book: ${error?.message || error}` };
  }
});

export default createRouter;
