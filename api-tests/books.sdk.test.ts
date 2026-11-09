import { describe, expect, test } from 'vitest';
import { BooksApi, Configuration } from '../generated-client';

const configuration = new Configuration({
  basePath: 'http://localhost:3000',
});

const booksApi = new BooksApi(configuration);

describe('Books API generated SDK', () => {
  test('lists books using the generated SDK', async () => {
    const books = await booksApi.listBooks();

    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBeGreaterThan(0);

    expect(books[0]).toHaveProperty('id');
    expect(books[0]).toHaveProperty('name');
    expect(books[0]).toHaveProperty('stock');
  });

  test('looks up an individual book using the generated SDK', async () => {
    const books = await booksApi.listBooks();

    expect(books.length).toBeGreaterThan(0);

    const bookId = books[0].id;

    const book = await booksApi.getBookById({
      id: bookId,
    });

    expect(book.id).toBe(bookId);
    expect(book).toHaveProperty('name');
    expect(book).toHaveProperty('stock');
  });
});
