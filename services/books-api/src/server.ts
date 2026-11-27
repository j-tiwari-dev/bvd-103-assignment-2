import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import qs from 'koa-qs';
import Router from '@koa/router';

import { connectToDatabase, disconnectFromDatabase } from './db';
import { RegisterRoutes } from '../build/routes';
import { rabbitmq, subscribeToStockEvents } from './events';

const app = new Koa();
const router = new Router();

qs(app);

app.use(cors());
app.use(bodyParser());

RegisterRoutes(router);

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = Number(process.env.PORT || 3000);

async function connectRabbitMQ(): Promise<void> {
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await rabbitmq.connect();
      console.log('Books API connected to RabbitMQ');
      return;
    } catch (error) {
      console.error(
        'RabbitMQ connection attempt ' + attempt + ' failed:',
        error
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

async function startServer(): Promise<void> {
  await connectToDatabase();

  await connectRabbitMQ();
  await subscribeToStockEvents();

  const server = app.listen(PORT, () => {
    console.log('Books API running on port ' + PORT);
  });

  async function shutdown(): Promise<void> {
    console.log('Shutting down Books API');

    server.close(async () => {
      try {
        await rabbitmq.close();
        await disconnectFromDatabase();
        process.exit(0);
      } catch (error) {
        console.error('Shutdown error:', error);
        process.exit(1);
      }
    });
  }

  process.once('SIGTERM', () => {
    void shutdown();
  });

  process.once('SIGINT', () => {
    void shutdown();
  });
}

startServer().catch((error) => {
  console.error('Failed to start Books API:', error);
  process.exit(1);
});
