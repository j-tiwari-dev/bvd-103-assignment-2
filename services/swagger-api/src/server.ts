import Koa from 'koa';
import Router from '@koa/router';
import { koaSwagger } from 'koa2-swagger-ui';
 
import swaggerDocument from '../build/swagger.json';
 
const app = new Koa();
const router = new Router();
 
const PORT = Number(process.env.PORT || 3000);
 
router.get('/health', (ctx) => {
  ctx.status = 200;
  ctx.body = {
    status: 'ok',
    service: 'swagger-api',
  };
});
 
app.use(router.routes());
app.use(router.allowedMethods());
 
app.use(
  koaSwagger({
    routePrefix: '/docs',
    swaggerOptions: {
      spec: swaggerDocument,
    },
  })
);
 
app.listen(PORT, () => {
  console.log(`Swagger documentation running on port ${PORT}`);
});
