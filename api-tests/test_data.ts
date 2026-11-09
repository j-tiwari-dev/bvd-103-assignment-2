import { MongoClient, ObjectId } from 'mongodb';

const mongoUrl = process.env.MONGODB_URL ?? 'mongodb://localhost:27017';

const databaseName = 'mcmasterful-books';

export interface TestBook {
  id: string;
  objectId: ObjectId;
}

export async function createTestBook(): Promise<TestBook> {
  const client = new MongoClient(mongoUrl);

  await client.connect();

  try {
    const objectId = new ObjectId();

    await client.db(databaseName).collection('books').insertOne({
      _id: objectId,
      name: 'Generated SDK Test Book',
      author: 'API Test Author',
      description: 'A book created for generated SDK API testing.',
      price: 19.99,
      image: 'https://example.com/sdk-test-book.jpg',
    });

    return {
      id: objectId.toString(),
      objectId,
    };
  } finally {
    await client.close();
  }
}

export async function removeTestBook(objectId: ObjectId): Promise<void> {
  const client = new MongoClient(mongoUrl);

  await client.connect();

  try {
    await client.db(databaseName).collection('books').deleteOne({
      _id: objectId,
    });
  } finally {
    await client.close();
  }
}
