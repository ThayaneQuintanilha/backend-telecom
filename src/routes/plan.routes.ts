import { Router } from 'express';
import { planController } from '../controllers/plan.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', planController.create);
router.get('/', planController.list);
router.get('/:id', planController.getById);
router.put('/:id', planController.update);
router.patch('/:id/status', planController.toggleStatus);

export { router as planRoutes };
