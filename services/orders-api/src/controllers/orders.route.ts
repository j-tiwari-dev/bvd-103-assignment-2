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
  type TsoaResponse,
} from 'tsoa';

import { ObjectId } from 'mongodb';
import { getDatabase } from '../db';

import {
  createOrderRecord,
  getOrderRecord,
  listOrderRecords,
  updateOrderStatus,
} from '../orders/order_repository';

import { publishFulfilmentRequest, type FulfilmentItem } from '../events';

interface PlaceOrderRequest {
  books: Record<string, number>;
}

interface OrderResponse {
  orderId: string;
  books: Record<string, number>;
  status: string;
}

interface PlaceOrderResponse {
  orderId: string;
}

interface OrderErrorResponse {
  message: string;
}

interface FulfilOrderRequest {
  booksFulfilled: FulfilmentItem[];
}

@Route('orders')
@Tags('Orders')
export class OrdersController extends Controller {
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
      Array.isArray(body.books) ||
      Object.keys(body.books).length === 0
    ) {
      return badRequest(400, { message: 'Invalid order' });
    }

    const db = getDatabase();

    for (const [bookId, quantity] of Object.entries(body.books)) {
      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        return badRequest(400, {
          message: 'Invalid book quantity',
        });
      }

      if (!ObjectId.isValid(bookId)) {
        return badRequest(400, {
          message: 'Invalid book ID',
        });
      }

      const exists = await db.collection('valid_books').findOne({
        bookId,
      });

      if (!exists) {
        return badRequest(400, {
          message: 'Book not found',
        });
      }
    }

    const result = await createOrderRecord(body.books);

    this.setStatus(201);
    return result;
  }

  @Get()
  public async listOrders(): Promise<OrderResponse[]> {
    const orders = await listOrderRecords();

    return orders.map((order) => ({
      orderId: order.orderId,
      books: order.books,
      status: order.status,
    }));
  }

  @Post('{orderId}/fulfil')
  @SuccessResponse('202', 'Fulfilment requested')
  public async fulfilOrder(
    @Path() orderId: string,
    @Body() body: FulfilOrderRequest,
    @Res() badRequest: TsoaResponse<400, OrderErrorResponse>,
    @Res() notFound: TsoaResponse<404, OrderErrorResponse>,
    @Res() conflict: TsoaResponse<409, OrderErrorResponse>
  ): Promise<void> {
    if (
      !body ||
      !Array.isArray(body.booksFulfilled) ||
      body.booksFulfilled.length === 0
    ) {
      return badRequest(400, {
        message: 'Invalid fulfilment request',
      });
    }

    const order = await getOrderRecord(orderId);

    if (!order) {
      return notFound(404, {
        message: 'Order not found',
      });
    }

    if (order.status !== 'pending' && order.status !== 'failed') {
      return conflict(409, {
        message: 'Order is already being processed or fulfilled',
      });
    }

    const totals = new Map<string, number>();

    for (const item of body.booksFulfilled) {
      if (
        !item ||
        typeof item.book !== 'string' ||
        typeof item.shelf !== 'string' ||
        !item.shelf.trim() ||
        !Number.isSafeInteger(item.numberOfBooks) ||
        item.numberOfBooks <= 0
      ) {
        return badRequest(400, {
          message: 'Invalid fulfilment item',
        });
      }

      totals.set(item.book, (totals.get(item.book) ?? 0) + item.numberOfBooks);
    }

    if (
      Object.keys(order.books).length !== totals.size ||
      Object.entries(order.books).some(
        ([bookId, quantity]) => totals.get(bookId) !== quantity
      )
    ) {
      return badRequest(400, {
        message: 'Order quantities do not match',
      });
    }

    const claim = await getDatabase()
      .collection('orders')
      .updateOne(
        { orderId, status: order.status },
        {
          $set: {
            status: 'fulfilling',
            updatedAt: new Date(),
          },
        }
      );

    if (claim.modifiedCount !== 1) {
      return conflict(409, {
        message: 'Order status changed; please retry',
      });
    }

    try {
      await publishFulfilmentRequest(orderId, body.booksFulfilled);
    } catch (error) {
      await updateOrderStatus(orderId, 'failed', 'Unable to publish request');
      throw error;
    }

    this.setStatus(202);
  }
}
