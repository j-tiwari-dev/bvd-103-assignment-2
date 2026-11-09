import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { BooksApi, Configuration } from '../generated-client';
import { createTestBook, removeTestBook, type TestBook } from './test_data';

const configuration = new Configuration({
  basePath: 'http://localhost:3000',
});

const booksApi = new BooksApi(configuration);

describe('Books API generated SDK', () => {
  let testBook: TestBook;

  beforeAll(async () => {
    testBook = await createTestBook();
  });

  afterAll(async () => {
    await removeTestBook(testBook.objectId);
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
});
