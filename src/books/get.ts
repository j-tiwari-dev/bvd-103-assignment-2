import Router from '@koa/router';
import { ObjectId, type Collection } from 'mongodb';
import { getDatabase } from '../db';

interface DatabaseBook {
  _id: ObjectId;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

interface BookDatabase {
  books: Pick<Collection<DatabaseBook>, 'findOne'>;
}

export interface Book {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export async function lookupBookById(
  bookId: string,
  database: BookDatabase
): Promise<Book | false> {
  if (!ObjectId.isValid(bookId)) {
    return false;
  }

  const book = await database.books.findOne({
    _id: new ObjectId(bookId),
  });

  if (!book) {
    return false;
  }

  return {
    id: book._id.toString(),
    name: book.name,
    author: book.author,
    description: book.description,
    price: book.price,
    image: book.image,
    stock: 0,
  };
}

const getRouter = new Router();

getRouter.get('/books/:id', async (ctx) => {
  const { id } = ctx.params;

  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid book ID format' };
    return;
  }

  const db = getDatabase();

  const book = await lookupBookById(id, {
    books: db.collection<DatabaseBook>('books'),
  });

  if (!book) {
    ctx.status = 404;
    ctx.body = { error: 'Book not found' };
    return;
  }

  ctx.status = 200;
  ctx.body = book;
});

export default getRouter;
