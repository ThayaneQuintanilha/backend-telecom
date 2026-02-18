import { Router } from 'express';
import { vehicleController } from '../controllers/vehicle.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', vehicleController.list);
router.get('/:id', vehicleController.getById);
router.post('/', vehicleController.create);
router.patch('/:id/status', vehicleController.updateStatus);
router.delete('/:id', vehicleController.deactivate);

export default router;
