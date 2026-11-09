import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { getDatabase } from '../db';
import { DatabaseWarehouse } from '../warehouse/warehouse_database';

interface PlaceBooksRequest {
  bookId: string;
  numberOfBooks: number;
  shelf: string;
}

interface ShelfResponse {
  shelf: string;
  count: number;
}

function getWarehouse(): DatabaseWarehouse {
  const db = getDatabase();
  const warehouseDatabase = db.client.db('mcmasterful-warehouse');

  return new DatabaseWarehouse(warehouseDatabase);
}

@Route('warehouse')
@Tags('Warehouse')
export class WarehouseController extends Controller {
  @Post('shelves')
  @SuccessResponse('204', 'Books placed on shelf')
  public async placeBooksOnShelf(
    @Body() body: PlaceBooksRequest
  ): Promise<void> {
    if (
      !body.bookId ||
      !body.shelf ||
      !Number.isInteger(body.numberOfBooks) ||
      body.numberOfBooks <= 0
    ) {
      this.setStatus(400);
      throw new Error('Invalid shelf placement');
    }

    const warehouse = getWarehouse();

    await warehouse.placeBookOnShelf(
      body.bookId,
      body.shelf,
      body.numberOfBooks
    );

    this.setStatus(204);
  }

  @Get('books/{bookId}')
  public async findBookOnShelf(
    @Path() bookId: string
  ): Promise<ShelfResponse[]> {
    const warehouse = getWarehouse();

    const copies = await warehouse.getCopies(bookId);

    return Object.entries(copies).map(([shelf, count]) => ({
      shelf,
      count,
    }));
  }
}
