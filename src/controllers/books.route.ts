import { Controller, Get, Path, Query, Route, Tags } from 'tsoa';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../db';
import { DatabaseWarehouse } from '../warehouse/warehouse_database';

export interface BookResponse {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

@Route('books')
@Tags('Books')
export class BooksController extends Controller {
  @Get()
  public async listBooks(
    @Query() name?: string,
    @Query() author?: string,
    @Query() priceFrom?: number,
    @Query() priceTo?: number
  ): Promise<BookResponse[]> {
    const db = getDatabase();

    const query: Record<string, unknown> = {};
    const priceQuery: Record<string, number> = {};

    if (name) {
      query.name = {
        $regex: name,
        $options: 'i',
      };
    }

    if (author) {
      query.author = {
        $regex: author,
        $options: 'i',
      };
    }

    if (priceFrom !== undefined) {
      priceQuery.$gte = priceFrom;
    }

    if (priceTo !== undefined) {
      priceQuery.$lte = priceTo;
    }

    if (Object.keys(priceQuery).length > 0) {
      query.price = priceQuery;
    }

    const books = await db.collection('books').find(query).toArray();

    const warehouseDatabase = db.client.db('mcmasterful-warehouse');
    const warehouse = new DatabaseWarehouse(warehouseDatabase);

    return Promise.all(
      books.map(async (book) => {
        const id = book._id.toString();
        const copies = await warehouse.getCopies(id);

        const stock = Object.values(copies).reduce(
          (total, count) => total + count,
          0
        );

        return {
          id,
          name: book.name as string,
          author: book.author as string,
          description: book.description as string,
          price: book.price as number,
          image: book.image as string,
          stock,
        };
      })
    );
  }

  @Get('{id}')
  public async getBookById(@Path() id: string): Promise<BookResponse> {
    if (!ObjectId.isValid(id)) {
      this.setStatus(400);
      throw new Error('Invalid book ID format');
    }

    const db = getDatabase();

    const book = await db.collection('books').findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      this.setStatus(404);
      throw new Error('Book not found');
    }

    const warehouseDatabase = db.client.db('mcmasterful-warehouse');
    const warehouse = new DatabaseWarehouse(warehouseDatabase);

    const copies = await warehouse.getCopies(id);

    const stock = Object.values(copies).reduce(
      (total, count) => total + count,
      0
    );

    return {
      id: book._id.toString(),
      name: book.name as string,
      author: book.author as string,
      description: book.description as string,
      price: book.price as number,
      image: book.image as string,
      stock,
    };
  }
}
