import { BooksApi, Configuration } from '../generated-client';

const configuration = new Configuration({
  basePath: process.env.API_BASE_URL ?? 'http://localhost:8081/api',
});

const booksApi = new BooksApi(configuration);

export interface TestBook {
  id: string;
}

export async function createTestBook(): Promise<TestBook> {
  const result = await booksApi.createBook({
    bookInput: {
      name: 'Generated SDK Test Book',
      author: 'API Test Author',
      description: 'A book created for generated SDK API testing.',
      price: 19.99,
      image: 'https://example.com/sdk-test-book.jpg',
    },
  });

  return {
    id: result.id,
  };
}

export async function removeTestBook(id: string): Promise<void> {
  await booksApi.deleteBook({
    id,
  });
}
