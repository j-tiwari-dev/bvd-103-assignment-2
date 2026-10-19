import Router from '@koa/router';
import listRouter from './lists';
import createRouter from './create';
import deleteRouter from './delete';
import getRouter from './get';

const router = new Router();

router.use(listRouter.routes());
router.use(createRouter.routes());
router.use(deleteRouter.routes());
router.use(getRouter.routes());

router.use(listRouter.allowedMethods());
router.use(createRouter.allowedMethods());
router.use(deleteRouter.allowedMethods());
router.use(getRouter.allowedMethods());

export default router;
