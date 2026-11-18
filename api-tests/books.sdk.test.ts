import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { BooksApi, Configuration } from '../generated-client';

import { createTestBook, removeTestBook, type TestBook } from './test_data';

const configuration = new Configuration({
  basePath: process.env.API_BASE_URL ?? 'http://localhost:8080/api',
});

const booksApi = new BooksApi(configuration);

const validBookInput = {
  name: 'CRUD SDK Test Book',

  author: 'API Test Author',

  description: 'A book created through the generated SDK.',

  price: 19.99,

  image: 'https://example.com/sdk-test-book.jpg',
};

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

    expect(books.some((book) => book.id === testBook.id)).toBe(false);
  });

  test('creates a book using the generated SDK', async () => {
    const result = await booksApi.createBook({
      bookInput: validBookInput,
    });

    try {
      expect(result.id).toBeDefined();

      const book = await booksApi.getBookById({
        id: result.id,
      });

      expect(book.name).toBe(validBookInput.name);

      expect(book.author).toBe(validBookInput.author);

      expect(book.price).toBe(validBookInput.price);
    } finally {
      await booksApi.deleteBook({ id: result.id });
    }
  });

  test('updates an existing book using the generated SDK', async () => {
    const result = await booksApi.createBook({
      bookInput: validBookInput,
    });

    try {
      await booksApi.updateBook({
        id: result.id,

        bookInput: {
          ...validBookInput,

          name: 'Updated SDK Test Book',

          price: 29.99,
        },
      });

      const updated = await booksApi.getBookById({
        id: result.id,
      });

      expect(updated.name).toBe('Updated SDK Test Book');

      expect(updated.price).toBe(29.99);
    } finally {
      await booksApi.deleteBook({ id: result.id });
    }
  });

  test('deletes a book using the generated SDK', async () => {
    const result = await booksApi.createBook({
      bookInput: validBookInput,
    });

    await booksApi.deleteBook({
      id: result.id,
    });

    await expect(
      booksApi.getBookById({
        id: result.id,
      })
    ).rejects.toMatchObject({
      response: {
        status: 404,
      },
    });
  });

  test('rejects an invalid book ID with HTTP 400', async () => {
    await expect(
      booksApi.getBookById({
        id: 'invalid-id',
      })
    ).rejects.toMatchObject({
      response: {
        status: 400,
      },
    });
  });

  test('returns HTTP 404 for a missing book', async () => {
    await expect(
      booksApi.getBookById({
        id: '000000000000000000000000',
      })
    ).rejects.toMatchObject({
      response: {
        status: 404,
      },
    });
  });

  test('rejects invalid book data with HTTP 400', async () => {
    await expect(
      booksApi.createBook({
        bookInput: {
          ...validBookInput,

          name: '',
        },
      })
    ).rejects.toMatchObject({
      response: {
        status: 400,
      },
    });
  });
});
