import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Res,
  Response,
  Route,
  SuccessResponse,
  Tags,
  type TsoaResponse,
} from 'tsoa';

import { ObjectId } from 'mongodb';
import { getDatabase } from '../db';
import { getWarehouse } from '../warehouse/get_warehouse';

interface PlaceBooksRequest {
  bookId: string;
  numberOfBooks: number;
  shelf: string;
}

interface ShelfResponse {
  shelf: string;
  count: number;
}

interface ErrorResponse {
  error: string;
}

@Route('warehouse')
@Tags('Warehouse')
export class WarehouseController extends Controller {
  /**
   * Adds copies of a book to a warehouse shelf.
   *
   * Only positive whole-number quantities are accepted.
   * The book must exist in the database.
   * Existing shelf inventory is increased by the supplied quantity.
   *
   * @summary Place books on a warehouse shelf
   */
  @Post('shelves')
  @SuccessResponse('204', 'Books placed on shelf')
  @Response<ErrorResponse>('400', 'Invalid shelf placement')
  public async placeBooksOnShelf(
    @Body() body: PlaceBooksRequest,
    @Res() badRequest: TsoaResponse<400, ErrorResponse>
  ): Promise<void> {
    if (
      !body ||
      typeof body.bookId !== 'string' ||
      !body.bookId.trim() ||
      typeof body.shelf !== 'string' ||
      !body.shelf.trim() ||
      !Number.isSafeInteger(body.numberOfBooks) ||
      body.numberOfBooks <= 0
    ) {
      return badRequest(400, {
        error: 'Invalid shelf placement',
      });
    }

    if (!ObjectId.isValid(body.bookId)) {
      return badRequest(400, {
        error: 'Invalid book ID',
      });
    }

    const db = getDatabase();

    const book = await db.collection('books').findOne({
      _id: new ObjectId(body.bookId),
    });

    if (!book) {
      return badRequest(400, {
        error: 'Book not found',
      });
    }

    const warehouse = getWarehouse();

    await warehouse.placeBookOnShelf(
      body.bookId,
      body.shelf,
      body.numberOfBooks
    );

    this.setStatus(204);
  }

  /**
   * Retrieves all warehouse shelves containing copies of a book.
   *
   * Returns each shelf identifier and its available quantity.
   *
   * @summary Find book inventory by shelf
   */
  @Get('books/{bookId}')
  @Response<ErrorResponse>('400', 'Invalid book ID')
  public async findBookOnShelf(
    @Path() bookId: string,
    @Res() badRequest: TsoaResponse<400, ErrorResponse>
  ): Promise<ShelfResponse[] | void> {
    if (!bookId.trim()) {
      return badRequest(400, {
        error: 'Invalid book ID',
      });
    }

    const warehouse = getWarehouse();
    const copies = await warehouse.getCopies(bookId);

    return Object.entries(copies).map(([shelf, count]) => ({
      shelf,
      count,
    }));
  }
}
