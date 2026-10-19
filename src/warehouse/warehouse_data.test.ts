import { describe, expect, test } from 'vitest';
import { InMemoryWarehouse } from './warehouse_data';

describe('InMemoryWarehouse', () => {
  test('places copies of a book on a shelf', async () => {
    const warehouse = new InMemoryWarehouse();

    await warehouse.placeBookOnShelf('book-1', 'shelf-a', 5);

    const copies = await warehouse.getCopiesOnShelf('book-1', 'shelf-a');

    expect(copies).toBe(5);
  });

  test('adds more copies to an existing shelf', async () => {
    const warehouse = new InMemoryWarehouse();

    await warehouse.placeBookOnShelf('book-1', 'shelf-a', 5);
    await warehouse.placeBookOnShelf('book-1', 'shelf-a', 3);

    const copies = await warehouse.getCopiesOnShelf('book-1', 'shelf-a');

    expect(copies).toBe(8);
  });

  test('stores the same book on multiple shelves', async () => {
    const warehouse = new InMemoryWarehouse();

    await warehouse.placeBookOnShelf('book-1', 'shelf-a', 5);
    await warehouse.placeBookOnShelf('book-1', 'shelf-b', 3);

    const copies = await warehouse.getCopies('book-1');

    expect(copies).toEqual({
      'shelf-a': 5,
      'shelf-b': 3,
    });
  });

  test('returns zero when a book is not on a shelf', async () => {
    const warehouse = new InMemoryWarehouse();

    const copies = await warehouse.getCopiesOnShelf('book-1', 'unknown-shelf');

    expect(copies).toBe(0);
  });

  test('returns no shelves for a book that is not in the warehouse', async () => {
    const warehouse = new InMemoryWarehouse();

    const copies = await warehouse.getCopies('unknown-book');

    expect(copies).toEqual({});
  });
});
