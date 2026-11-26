import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Res,
  Route,
  SuccessResponse,
  Tags,
  TsoaResponse,
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

interface OrderErrorResponse {
  message: string;
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
    @Body() body: PlaceOrderRequest,
    @Res() badRequest: TsoaResponse<400, OrderErrorResponse>
  ): Promise<PlaceOrderResponse> {
    if (
      !body ||
      !body.books ||
      typeof body.books !== 'object' ||
      Array.isArray(body.books)
    ) {
      return badRequest(400, { message: 'Invalid order' });
    }

    const warehouse = getWarehouse();

    try {
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
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'Invalid book quantity' ||
          error.message === 'Book not found')
      ) {
        return badRequest(400, { message: error.message });
      }

      throw error;
    }
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
    @Body() body: FulfilOrderRequest,
    @Res() badRequest: TsoaResponse<400, OrderErrorResponse>,
    @Res() notFound: TsoaResponse<404, OrderErrorResponse>
  ): Promise<void> {
    if (!body || !Array.isArray(body.booksFulfilled)) {
      return badRequest(400, {
        message: 'Invalid fulfilment request',
      });
    }

    const warehouse = getWarehouse();

    try {
      await fulfilOrder(orderId, body.booksFulfilled, warehouse);

      this.setStatus(204);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          return notFound(404, {
            message: 'Order not found',
          });
        }

        const validationErrors = [
          'Invalid fulfilment quantity',
          'Invalid book or shelf',
          'Not enough stock',
          'Order quantities do not match',
          'Book not in order',
        ];

        if (validationErrors.includes(error.message)) {
          return badRequest(400, {
            message: error.message,
          });
        }
      }

      throw error;
    }
  }
}
