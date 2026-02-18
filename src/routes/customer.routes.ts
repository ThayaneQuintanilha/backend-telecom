import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// Todas as rotas de clientes requerem autenticação
router.use(authenticate);

// GET /api/customers
router.get('/', customerController.list);

// GET /api/customers/:id
router.get('/:id', customerController.getById);

// POST /api/customers
router.post(
    '/',
    validate({
        name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
    }),
    customerController.create
);

// PUT /api/customers/:id
router.put('/:id', customerController.update);

router.patch('/:id/plan', customerController.updatePlan);

// DELETE /api/customers/:id (soft delete)
router.delete('/:id', customerController.delete);

export default router;
