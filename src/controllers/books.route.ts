import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';

import { ObjectId } from 'mongodb';

import { getDatabase } from '../db';

import { DatabaseWarehouse } from '../warehouse/warehouse_database';

export interface BookInput {
  name: string;

  author: string;

  description: string;

  price: number;

  image: string;
}

export interface BookResponse {
  id: string;

  name: string;

  author: string;

  description: string;

  price: number;

  image: string;

  stock: number;
}

export interface BookIdResponse {
  id: string;
}

function validateBookInput(book: BookInput): void {
  if (!book || typeof book !== 'object' || Array.isArray(book)) {
    throw new Error('Request body must be a valid object');
  }

  if (typeof book.name !== 'string' || book.name.trim() === '') {
    throw new Error('Book "name" is required and cannot be empty');
  }

  if (typeof book.author !== 'string' || book.author.trim() === '') {
    throw new Error('Book "author" is required and cannot be empty');
  }

  if (typeof book.description !== 'string') {
    throw new Error('Book "description" must be a string');
  }

  if (
    typeof book.price !== 'number' ||
    Number.isNaN(book.price) ||
    book.price < 0
  ) {
    throw new Error('Book "price" must be a non-negative number');
  }

  if (typeof book.image !== 'string') {
    throw new Error('Book "image" must be a string');
  }
}

function formatBookInput(book: BookInput): BookInput {
  return {
    name: book.name.trim(),

    author: book.author.trim(),

    description: book.description.trim(),

    price: book.price,

    image: book.image.trim(),
  };
}

function getWarehouse(): DatabaseWarehouse {
  const database = getDatabase();

  const warehouseDatabase = database.client.db('mcmasterful-warehouse');

  return new DatabaseWarehouse(warehouseDatabase);
}

function calculateTotalStock(copies: Record<string, number>): number {
  return Object.values(copies).reduce(
    (total, count) => total + count,

    0
  );
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
    const database = getDatabase();

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

    const books = await database

      .collection('books')

      .find(query)

      .toArray();

    const warehouse = getWarehouse();

    return Promise.all(
      books.map(async (book) => {
        const id = book._id.toString();

        const copies = await warehouse.getCopies(id);

        return {
          id,

          name: book.name as string,

          author: book.author as string,

          description: book.description as string,

          price: book.price as number,

          image: book.image as string,

          stock: calculateTotalStock(copies),
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

    const database = getDatabase();

    const book = await database

      .collection('books')

      .findOne({
        _id: new ObjectId(id),
      });

    if (!book) {
      this.setStatus(404);

      throw new Error('Book not found');
    }

    const warehouse = getWarehouse();

    const copies = await warehouse.getCopies(id);

    return {
      id: book._id.toString(),

      name: book.name as string,

      author: book.author as string,

      description: book.description as string,

      price: book.price as number,

      image: book.image as string,

      stock: calculateTotalStock(copies),
    };
  }

  @Post()
  @SuccessResponse('201', 'Book created')
  public async createBook(@Body() body: BookInput): Promise<BookIdResponse> {
    try {
      validateBookInput(body);
    } catch (error) {
      this.setStatus(400);

      throw error;
    }

    const database = getDatabase();

    const book = formatBookInput(body);

    const result = await database

      .collection<BookInput>('books')

      .insertOne(book);

    this.setStatus(201);

    return {
      id: result.insertedId.toString(),
    };
  }

  @Put('{id}')
  public async updateBook(
    @Path() id: string,

    @Body() body: BookInput
  ): Promise<BookIdResponse> {
    if (!ObjectId.isValid(id)) {
      this.setStatus(400);

      throw new Error('Invalid book ID format');
    }

    try {
      validateBookInput(body);
    } catch (error) {
      this.setStatus(400);

      throw error;
    }

    const database = getDatabase();

    const book = formatBookInput(body);

    const result = await database

      .collection<BookInput>('books')

      .updateOne(
        {
          _id: new ObjectId(id),
        },

        {
          $set: book,
        }
      );

    if (result.matchedCount === 0) {
      this.setStatus(404);

      throw new Error('Book not found');
    }

    this.setStatus(200);

    return {
      id,
    };
  }

  @Delete('{id}')
  @SuccessResponse('204', 'Book deleted')
  public async deleteBook(@Path() id: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      this.setStatus(400);

      throw new Error('Invalid book ID format');
    }

    const database = getDatabase();

    const result = await database

      .collection('books')

      .deleteOne({
        _id: new ObjectId(id),
      });

    if (result.deletedCount === 0) {
      this.setStatus(404);

      throw new Error('Book not found');
    }

    this.setStatus(204);
  }
}
