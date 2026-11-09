/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import { fetchMiddlewares, KoaTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { WarehouseController } from './../src/controllers/warehouse.route';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrdersController } from './../src/controllers/orders.route';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { HealthController } from './../src/controllers/health.route';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { BooksController } from './../src/controllers/books.route';
import type { Context, Next, Middleware, Request as KRequest, Response as KResponse } from 'koa';
import type * as KoaRouter from '@koa/router';


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "PlaceBooksRequest": {
        "dataType": "refObject",
        "properties": {
            "bookId": {"dataType":"string","required":true},
            "numberOfBooks": {"dataType":"double","required":true},
            "shelf": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ShelfResponse": {
        "dataType": "refObject",
        "properties": {
            "shelf": {"dataType":"string","required":true},
            "count": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlaceOrderResponse": {
        "dataType": "refObject",
        "properties": {
            "orderId": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Record_string.number_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{},"additionalProperties":{"dataType":"double"},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlaceOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "books": {"ref":"Record_string.number_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OrderResponse": {
        "dataType": "refObject",
        "properties": {
            "orderId": {"dataType":"string","required":true},
            "books": {"ref":"Record_string.number_","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FulfilledBook": {
        "dataType": "refObject",
        "properties": {
            "book": {"dataType":"string","required":true},
            "shelf": {"dataType":"string","required":true},
            "numberOfBooks": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FulfilOrderRequest": {
        "dataType": "refObject",
        "properties": {
            "booksFulfilled": {"dataType":"array","array":{"dataType":"refObject","ref":"FulfilledBook"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "BookResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "author": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "image": {"dataType":"string","required":true},
            "stock": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new KoaTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


export function RegisterRoutes(router: KoaRouter) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


        const argsWarehouseController_placeBooksOnShelf: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"PlaceBooksRequest"},
        };
        router.post('/warehouse/shelves',
            ...(fetchMiddlewares<Middleware>(WarehouseController)),
            ...(fetchMiddlewares<Middleware>(WarehouseController.prototype.placeBooksOnShelf)),

            async function WarehouseController_placeBooksOnShelf(context: Context, next: Next) {

            let validatedArgs: any[] = [];
            try {
              validatedArgs = templateService.getValidatedArgs({ args: argsWarehouseController_placeBooksOnShelf, context, next });
            } catch (err) {
              const error = err as any;
              error.message ||= JSON.stringify({ fields: error.fields });
              context.status = error.status;
              context.throw(context.status, error.message, error);
            }

            const controller = new WarehouseController();

            return templateService.apiHandler({
              methodName: 'placeBooksOnShelf',
              controller,
              context,
              validatedArgs,
              successStatus: 204,
            });
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsWarehouseController_findBookOnShelf: Record<string, TsoaRoute.ParameterSchema> = {
                bookId: {"in":"path","name":"bookId","required":true,"dataType":"string"},
        };
        router.get('/warehouse/books/:bookId',
            ...(fetchMiddlewares<Middleware>(WarehouseController)),
            ...(fetchMiddlewares<Middleware>(WarehouseController.prototype.findBookOnShelf)),

            async function WarehouseController_findBookOnShelf(context: Context, next: Next) {

            let validatedArgs: any[] = [];
            try {
              validatedArgs = templateService.getValidatedArgs({ args: argsWarehouseController_findBookOnShelf, context, next });
            } catch (err) {
              const error = err as any;
              error.message ||= JSON.stringify({ fields: error.fields });
              context.status = error.status;
              context.throw(context.status, error.message, error);
            }

            const controller = new WarehouseController();

            return templateService.apiHandler({
              methodName: 'findBookOnShelf',
              controller,
              context,
              validatedArgs,
              successStatus: undefined,
            });
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrdersController_createOrder: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"PlaceOrderRequest"},
        };
        router.post('/orders',
            ...(fetchMiddlewares<Middleware>(OrdersController)),
            ...(fetchMiddlewares<Middleware>(OrdersController.prototype.createOrder)),

            async function OrdersController_createOrder(context: Context, next: Next) {

            let validatedArgs: any[] = [];
            try {
              validatedArgs = templateService.getValidatedArgs({ args: argsOrdersController_createOrder, context, next });
            } catch (err) {
              const error = err as any;
              error.message ||= JSON.stringify({ fields: error.fields });
              context.status = error.status;
              context.throw(context.status, error.message, error);
            }

            const controller = new OrdersController();

            return templateService.apiHandler({
              methodName: 'createOrder',
              controller,
              context,
              validatedArgs,
              successStatus: 201,
            });
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrdersController_listOrders: Record<string, TsoaRoute.ParameterSchema> = {
        };
        router.get('/orders',
            ...(fetchMiddlewares<Middleware>(OrdersController)),
            ...(fetchMiddlewares<Middleware>(OrdersController.prototype.listOrders)),

            async function OrdersController_listOrders(context: Context, next: Next) {

            let validatedArgs: any[] = [];
            try {
              validatedArgs = templateService.getValidatedArgs({ args: argsOrdersController_listOrders, context, next });
            } catch (err) {
              const error = err as any;
              error.message ||= JSON.stringify({ fields: error.fields });
              context.status = error.status;
              context.throw(context.status, error.message, error);
            }

            const controller = new OrdersController();

            return templateService.apiHandler({
              methodName: 'listOrders',
              controller,
              context,
              validatedArgs,
              successStatus: undefined,
            });
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrdersController_fulfilOrder: Record<string, TsoaRoute.ParameterSchema> = {
                orderId: {"in":"path","name":"orderId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"ref":"FulfilOrderRequest"},
        };
        router.post('/orders/:orderId/fulfil',
            ...(fetchMiddlewares<Middleware>(OrdersController)),
            ...(fetchMiddlewares<Middleware>(OrdersController.prototype.fulfilOrder)),

            async function OrdersController_fulfilOrder(context: Context, next: Next) {

            let validatedArgs: any[] = [];
            try {
              validatedArgs = templateService.getValidatedArgs({ args: argsOrdersController_fulfilOrder, context, next });
            } catch (err) {
              const error = err as any;
              error.message ||= JSON.stringify({ fields: error.fields });
              context.status = error.status;
              context.throw(context.status, error.message, error);
            }

            const controller = new OrdersController();

            return templateService.apiHandler({
              methodName: 'fulfilOrder',
              controller,
              context,
              validatedArgs,
              successStatus: 204,
            });
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsHealthController_getHealth: Record<string, TsoaRoute.ParameterSchema> = {
        };
        router.get('/health',
            ...(fetchMiddlewares<Middleware>(HealthController)),
            ...(fetchMiddlewares<Middleware>(HealthController.prototype.getHealth)),

            async function HealthController_getHealth(context: Context, next: Next) {

            let validatedArgs: any[] = [];
            try {
              validatedArgs = templateService.getValidatedArgs({ args: argsHealthController_getHealth, context, next });
            } catch (err) {
              const error = err as any;
              error.message ||= JSON.stringify({ fields: error.fields });
              context.status = error.status;
              context.throw(context.status, error.message, error);
            }

            const controller = new HealthController();

            return templateService.apiHandler({
              methodName: 'getHealth',
              controller,
              context,
              validatedArgs,
              successStatus: undefined,
            });
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBooksController_listBooks: Record<string, TsoaRoute.ParameterSchema> = {
                name: {"in":"query","name":"name","dataType":"string"},
                author: {"in":"query","name":"author","dataType":"string"},
                priceFrom: {"in":"query","name":"priceFrom","dataType":"double"},
                priceTo: {"in":"query","name":"priceTo","dataType":"double"},
        };
        router.get('/books',
            ...(fetchMiddlewares<Middleware>(BooksController)),
            ...(fetchMiddlewares<Middleware>(BooksController.prototype.listBooks)),

            async function BooksController_listBooks(context: Context, next: Next) {

            let validatedArgs: any[] = [];
            try {
              validatedArgs = templateService.getValidatedArgs({ args: argsBooksController_listBooks, context, next });
            } catch (err) {
              const error = err as any;
              error.message ||= JSON.stringify({ fields: error.fields });
              context.status = error.status;
              context.throw(context.status, error.message, error);
            }

            const controller = new BooksController();

            return templateService.apiHandler({
              methodName: 'listBooks',
              controller,
              context,
              validatedArgs,
              successStatus: undefined,
            });
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsBooksController_getBookById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        router.get('/books/:id',
            ...(fetchMiddlewares<Middleware>(BooksController)),
            ...(fetchMiddlewares<Middleware>(BooksController.prototype.getBookById)),

            async function BooksController_getBookById(context: Context, next: Next) {

            let validatedArgs: any[] = [];
            try {
              validatedArgs = templateService.getValidatedArgs({ args: argsBooksController_getBookById, context, next });
            } catch (err) {
              const error = err as any;
              error.message ||= JSON.stringify({ fields: error.fields });
              context.status = error.status;
              context.throw(context.status, error.message, error);
            }

            const controller = new BooksController();

            return templateService.apiHandler({
              methodName: 'getBookById',
              controller,
              context,
              validatedArgs,
              successStatus: undefined,
            });
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
