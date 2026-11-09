import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import qs from 'koa-qs';
import Router from '@koa/router';
import { koaSwagger } from 'koa2-swagger-ui';

import bookRoutes from './books/book_routes';
import warehouseRoutes from './warehouse/warehouse_routes';
import { connectToDatabase } from './db';

import swaggerDocument from '../build/swagger.json';
import { RegisterRoutes } from '../build/routes';

const app = new Koa();
const tsoaRouter = new Router();

qs(app);

app.use(cors());
app.use(bodyParser());

// Existing Assignment 4 book routes
app.use(bookRoutes.allowedMethods());
app.use(bookRoutes.routes());

// Existing Assignment 4 warehouse and order routes
app.use(warehouseRoutes.allowedMethods());
app.use(warehouseRoutes.routes());

// Generated tsoa routes
RegisterRoutes(tsoaRouter);

app.use(tsoaRouter.allowedMethods());
app.use(tsoaRouter.routes());

// Swagger UI
app.use(
  koaSwagger({
    routePrefix: '/docs',
    swaggerOptions: {
      spec: swaggerDocument,
    },
  })
);

const PORT = 3000;

async function startServer() {
  await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
