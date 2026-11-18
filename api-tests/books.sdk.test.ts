import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { BooksApi, Configuration } from '../generated-client';
import { createTestBook, removeTestBook, type TestBook } from './test_data';

const configuration = new Configuration({
  basePath: process.env.API_BASE_URL ?? 'http://localhost:8080/api',
});

const booksApi = new BooksApi(configuration);

describe('Books API generated SDK', () => {
  let testBook: TestBook;

  beforeAll(async () => {
    testBook = await createTestBook();
  });

  afterAll(async () => {
    if (testBook) {
      await removeTestBook(testBook.id);
    }
  });

  test('lists books using the generated SDK', async () => {
    const books = await booksApi.listBooks();

    const book = books.find((item) => item.id === testBook.id);

    expect(book).toBeDefined();
    expect(book?.name).toBe('Generated SDK Test Book');
    expect(book).toHaveProperty('stock');
  });

  test('looks up an individual book using the generated SDK', async () => {
    const book = await booksApi.getBookById({
      id: testBook.id,
    });

    expect(book.id).toBe(testBook.id);
    expect(book.name).toBe('Generated SDK Test Book');
    expect(book.stock).toBe(0);
  });

  test('handles special regex characters without a server error', async () => {
    const books = await booksApi.listBooks({
      name: '(',
    });

    expect(Array.isArray(books)).toBe(true);
  });

  test('treats regex characters as literal search text', async () => {
    const books = await booksApi.listBooks({
      name: '.*',
    });

    expect(Array.isArray(books)).toBe(true);

    // The seeded test book does not contain ".*" in its name.
    expect(books.some((book) => book.id === testBook.id)).toBe(false);
  });
});
