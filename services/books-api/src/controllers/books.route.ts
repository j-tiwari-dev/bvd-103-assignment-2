import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
  type TsoaResponse,
} from 'tsoa';

import { ObjectId } from 'mongodb';
import { getDatabase } from '../db';
import { publishBookEvent } from '../events';

export interface BookInput {
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

export interface BookResponse extends BookInput {
  id: string;
  stock: number;
}

export interface BookIdResponse {
  id: string;
}

export interface BookErrorResponse {
  error: string;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateBookInput(book: BookInput): string | false {
  if (!book || typeof book !== 'object' || Array.isArray(book)) {
    return 'Request body must be a valid object';
  }

  if (typeof book.name !== 'string' || !book.name.trim()) {
    return 'Book "name" is required and cannot be empty';
  }

  if (typeof book.author !== 'string' || !book.author.trim()) {
    return 'Book "author" is required and cannot be empty';
  }

  if (typeof book.description !== 'string') {
    return 'Book "description" must be a string';
  }

  if (
    typeof book.price !== 'number' ||
    !Number.isFinite(book.price) ||
    book.price < 0
  ) {
    return 'Book "price" must be a non-negative number';
  }

  if (typeof book.image !== 'string') {
    return 'Book "image" must be a string';
  }

  return false;
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

@Route('books')
@Tags('Books')
export class BooksController extends Controller {
  /**
   * Returns books matching the supplied filters.
   * Name and author searches are case-insensitive
   * and treat regex characters literally.
   *
   * @summary List and filter books
   */
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
        $regex: escapeRegex(name),
        $options: 'i',
      };
    }

    if (author) {
      query.author = {
        $regex: escapeRegex(author),
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

    const books = await database.collection('books').find(query).toArray();

    return Promise.all(
      books.map(async (book) => {
        const id = book._id.toString();

        return {
          id,
          name: book.name as string,
          author: book.author as string,
          description: book.description as string,
          price: book.price as number,
          image: book.image as string,
          stock: (book.stock as number) ?? 0,
        };
      })
    );
  }

  /**
   * Returns one book and its current total warehouse stock.
   *
   * @summary Get a book by ID
   */
  @Get('{id}')
  @Response<BookErrorResponse>('400', 'Invalid book ID')
  @Response<BookErrorResponse>('404', 'Book not found')
  public async getBookById(
    @Path() id: string,
    @Res() badRequest: TsoaResponse<400, BookErrorResponse>,
    @Res() notFound: TsoaResponse<404, BookErrorResponse>
  ): Promise<BookResponse | void> {
    if (!ObjectId.isValid(id)) {
      return badRequest(400, {
        error: 'Invalid book ID format',
      });
    }

    const database = getDatabase();

    const book = await database.collection('books').findOne({
      _id: new ObjectId(id),
    });

    if (!book) {
      return notFound(404, {
        error: 'Book not found',
      });
    }

    return {
      id: book._id.toString(),
      name: book.name as string,
      author: book.author as string,
      description: book.description as string,
      price: book.price as number,
      image: book.image as string,
      stock: (book.stock as number) ?? 0,
    };
  }

  /**
   * Creates a new book in the catalogue.
   *
   * @summary Create a book
   */
  @Post()
  @SuccessResponse('201', 'Book created')
  @Response<BookErrorResponse>('400', 'Invalid book')
  public async createBook(
    @Body() body: BookInput,
    @Res() badRequest: TsoaResponse<400, BookErrorResponse>
  ): Promise<BookIdResponse | void> {
    const error = validateBookInput(body);

    if (error) {
      return badRequest(400, { error });
    }

    const result = await getDatabase()
      .collection<BookInput>('books')
      .insertOne(formatBookInput(body));

    await publishBookEvent('BookAdded', {
      id: result.insertedId.toString(),
      ...formatBookInput(body),
    });

    this.setStatus(201);

    return {
      id: result.insertedId.toString(),
    };
  }

  /**
   * Updates an existing book.
   *
   * @summary Update a book
   */
  @Put('{id}')
  @Response<BookErrorResponse>('400', 'Invalid book or ID')
  @Response<BookErrorResponse>('404', 'Book not found')
  public async updateBook(
    @Path() id: string,
    @Body() body: BookInput,
    @Res() badRequest: TsoaResponse<400, BookErrorResponse>,
    @Res() notFound: TsoaResponse<404, BookErrorResponse>
  ): Promise<BookIdResponse | void> {
    if (!ObjectId.isValid(id)) {
      return badRequest(400, {
        error: 'Invalid book ID format',
      });
    }

    const error = validateBookInput(body);

    if (error) {
      return badRequest(400, { error });
    }

    const result = await getDatabase()
      .collection<BookInput>('books')
      .updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $set: formatBookInput(body),
        }
      );

    if (result.matchedCount === 0) {
      return notFound(404, {
        error: 'Book not found',
      });
    }

    await publishBookEvent('BookUpdated', {
      id,
      ...formatBookInput(body),
    });

    return { id };
  }

  /**
   * Deletes an existing book.
   *
   * @summary Delete a book
   */
  @Delete('{id}')
  @SuccessResponse('204', 'Book deleted')
  @Response<BookErrorResponse>('400', 'Invalid book ID')
  @Response<BookErrorResponse>('404', 'Book not found')
  public async deleteBook(
    @Path() id: string,
    @Res() badRequest: TsoaResponse<400, BookErrorResponse>,
    @Res() notFound: TsoaResponse<404, BookErrorResponse>
  ): Promise<void> {
    if (!ObjectId.isValid(id)) {
      badRequest(400, {
        error: 'Invalid book ID format',
      });
      return;
    }

    const result = await getDatabase()
      .collection('books')
      .deleteOne({
        _id: new ObjectId(id),
      });

    if (result.deletedCount === 0) {
      notFound(404, {
        error: 'Book not found',
      });
      return;
    }

    await publishBookEvent('BookDeleted', { id });

    this.setStatus(204);
  }
}
