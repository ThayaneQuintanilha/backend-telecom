import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

// POST /api/auth/login
router.post(
    '/login',
    validate({
        email: { required: true, type: 'email' },
        password: { required: true, type: 'string', minLength: 6 },
    }),
    authController.login
);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

export default router;
