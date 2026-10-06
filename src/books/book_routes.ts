import Router from '@koa/router';
import listRouter from './lists';
import createRouter from './create';
import deleteRouter from './delete';

const router = new Router();

// Mount the sub-routers
router.use(listRouter.routes());
router.use(createRouter.routes());
router.use(deleteRouter.routes());

// Optional: Mount the allowedMethods for all sub-routers at once
router.use(listRouter.allowedMethods());
router.use(createRouter.allowedMethods());
router.use(deleteRouter.allowedMethods());

export default router;
