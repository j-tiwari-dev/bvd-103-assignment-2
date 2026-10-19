import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll } from 'vitest';

let instance: MongoMemoryServer;

export async function setup(): Promise<void> {
  instance = await MongoMemoryServer.create({
    binary: { version: '7.0.7' },
  });

  const uri = instance.getUri();

  (global as any).__MONGOINSTANCE = instance;
  (global as any).MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
}

export async function teardown(): Promise<void> {
  if (instance) {
    await instance.stop({
      doCleanup: true,
    });
  }
}

beforeAll(async () => {
  await setup();
});

afterAll(async () => {
  await teardown();
});
