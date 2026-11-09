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
import { ObjectId } from 'mongodb';
import { getDatabase } from '../db';
import { DatabaseWarehouse } from '../warehouse/warehouse_database';
import { placeOrder } from '../warehouse/place_order';
import { fulfilOrder } from '../warehouse/fulfil_order';

interface PlaceOrderRequest {
  books: Record<string, number>;
}

interface OrderResponse {
  orderId: string;
  books: Record<string, number>;
}

interface PlaceOrderResponse {
  orderId: string;
}

interface FulfilledBook {
  book: string;
  shelf: string;
  numberOfBooks: number;
}

interface FulfilOrderRequest {
  booksFulfilled: FulfilledBook[];
}

function getWarehouse(): DatabaseWarehouse {
  const db = getDatabase();
  const warehouseDatabase = db.client.db('mcmasterful-warehouse');

  return new DatabaseWarehouse(warehouseDatabase);
}

@Route('orders')
@Tags('Orders')
export class OrdersController extends Controller {
  @Post()
  @SuccessResponse('201', 'Order created')
  public async createOrder(
    @Body() body: PlaceOrderRequest
  ): Promise<PlaceOrderResponse> {
    if (
      !body.books ||
      typeof body.books !== 'object' ||
      Array.isArray(body.books)
    ) {
      this.setStatus(400);
      throw new Error('Invalid order');
    }

    const warehouse = getWarehouse();

    const result = await placeOrder(body.books, warehouse, async (bookId) => {
      if (!ObjectId.isValid(bookId)) {
        return false;
      }

      const db = getDatabase();

      const book = await db.collection('books').findOne({
        _id: new ObjectId(bookId),
      });

      return book !== null;
    });

    this.setStatus(201);

    return result;
  }

  @Get()
  public async listOrders(): Promise<OrderResponse[]> {
    const warehouse = getWarehouse();

    return await warehouse.listOrders();
  }

  @Post('{orderId}/fulfil')
  @SuccessResponse('204', 'Order fulfilled')
  public async fulfilOrder(
    @Path() orderId: string,
    @Body() body: FulfilOrderRequest
  ): Promise<void> {
    if (!Array.isArray(body.booksFulfilled)) {
      this.setStatus(400);
      throw new Error('Invalid fulfilment request');
    }

    const warehouse = getWarehouse();

    await fulfilOrder(orderId, body.booksFulfilled, warehouse);

    this.setStatus(204);
  }
}
