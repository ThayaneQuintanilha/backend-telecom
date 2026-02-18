import { Router } from 'express';
import { routeController } from '../controllers/route.controller';
import { authenticate as authMiddleware } from '../middlewares/auth.middleware';

const router = Router();


router.use(authMiddleware);

router.get('/', routeController.list);
router.post('/', routeController.create);
router.get('/:id', routeController.getById);
router.patch('/:id/status', routeController.updateStatus);

export const routeRoutes = router;
