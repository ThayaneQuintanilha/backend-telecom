import { Router } from 'express';
import { workOrderController } from '../controllers/workOrder.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

// GET /api/work-orders
router.get('/', workOrderController.list);

// GET /api/work-orders/:id
router.get('/:id', workOrderController.getById);

// POST /api/work-orders
router.post(
    '/',
    validate({
        type: {
            required: true,
            enum: ['installation', 'maintenance', 'address_change', 'room_change', 'removal', 'inspection', 'other'],
        },
        customerId: { required: true, type: 'string' },
    }),
    workOrderController.create
);

// PATCH /api/work-orders/:id/status
router.patch(
    '/:id/status',
    validate({
        status: {
            required: true,
            enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold'],
        },
    }),
    workOrderController.updateStatus
);

// PATCH /api/work-orders/:id/checklist/:itemId
router.patch('/:id/checklist/:itemId', workOrderController.updateChecklist);

export default router;
