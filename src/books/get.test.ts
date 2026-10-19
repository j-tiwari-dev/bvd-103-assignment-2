import { describe, expect, test } from 'vitest';
import { ObjectId } from 'mongodb';
import { lookupBookById } from './get';

describe('lookupBookById', () => {
  test('returns a book matching the provided ID', async () => {
    const bookId = new ObjectId();

    const fakeBook = {
      _id: bookId,
      name: 'Test Book',
      author: 'Test Author',
      description: 'A test book',
      price: 19.99,
      image: 'test.jpg',
    };

    const fakeDatabase = {
      books: {
        findOne: async () => fakeBook,
      },
    };

    const result = await lookupBookById(bookId.toString(), fakeDatabase);

    expect(result).toEqual({
      id: bookId.toString(),
      name: 'Test Book',
      author: 'Test Author',
      description: 'A test book',
      price: 19.99,
      image: 'test.jpg',
      stock: 0,
    });
  });

  test('returns false when the book does not exist', async () => {
    const fakeDatabase = {
      books: {
        findOne: async () => null,
      },
    };

    const result = await lookupBookById(
      new ObjectId().toString(),
      fakeDatabase
    );

    expect(result).toBe(false);
  });

  test('returns false for an invalid book ID', async () => {
    const fakeDatabase = {
      books: {
        findOne: async () => null,
      },
    };

    const result = await lookupBookById('invalid-id', fakeDatabase);

    expect(result).toBe(false);
  });
});
