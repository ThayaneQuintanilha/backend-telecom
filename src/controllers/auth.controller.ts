import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

// ============================================================
// authController — Handlers HTTP para autenticação
// ============================================================

export const authController = {
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await authService.getMe(req.user!.id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    },

    async logout(_req: Request, res: Response): Promise<void> {
        res.status(200).json({ message: 'Logout realizado com sucesso' });
    },
};
