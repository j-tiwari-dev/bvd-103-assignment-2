import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import qs from 'koa-qs';
import Router from '@koa/router';
 
import { connectToDatabase } from './db';
import { RegisterRoutes } from '../build/routes';
 
const app = new Koa();
const router = new Router();
 
qs(app);
 
app.use(cors());
app.use(bodyParser());
 
RegisterRoutes(router);
 
app.use(router.routes());
app.use(router.allowedMethods());
 
const PORT = Number(process.env.PORT || 3000);
 
async function startServer() {
  await connectToDatabase();
 
  app.listen(PORT, () => {
    console.log('Warehouse API running on port ' + PORT);
  });
}
 
startServer().catch((error) => {
  console.error('Failed to start Warehouse API:', error);
  process.exit(1);
});
