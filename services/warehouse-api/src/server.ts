import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import qs from 'koa-qs';
import Router from '@koa/router';
import { koaSwagger } from 'koa2-swagger-ui';

import { connectToDatabase } from './db';

import swaggerDocument from '../build/swagger.json';
import { RegisterRoutes } from '../build/routes';

const app = new Koa();
const tsoaRouter = new Router();

qs(app);

app.use(cors());
app.use(bodyParser());

// Assignment 6: Use generated tsoa routes only
RegisterRoutes(tsoaRouter);

app.use(tsoaRouter.routes());
app.use(tsoaRouter.allowedMethods());

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
