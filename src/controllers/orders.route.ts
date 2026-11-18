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
import { getWarehouse } from '../warehouse/get_warehouse';
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

@Route('orders')
@Tags('Orders')
export class OrdersController extends Controller {
  /**
   * Creates a new order for the requested books.
   *
   * @summary Create an order
   */
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

  /**
   * Returns all outstanding orders.
   *
   * @summary List orders
   */
  @Get()
  public async listOrders(): Promise<OrderResponse[]> {
    const warehouse = getWarehouse();

    return await warehouse.listOrders();
  }

  /**
   * Fulfils an existing order using warehouse inventory.
   *
   * @summary Fulfil an order
   */
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
