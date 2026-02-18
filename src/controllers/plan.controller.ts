import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { planService } from '../services/plan.service';
import { PlanType } from '../models/Plan.model';

export const planController = {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const plan = await planService.create(req.user!.tenantId, req.body);
            res.status(201).json(plan);
        } catch (error) {
            next(error);
        }
    },

    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { active, type, search, page, limit } = req.query;

            const result = await planService.list({
                tenantId: req.user!.tenantId,
                active: active !== undefined ? active === 'true' : undefined,
                type: type as PlanType,
                search: search as string,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 50
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const plan = await planService.getById(req.user!.tenantId, String(req.params.id));
            res.json(plan);
        } catch (error) {
            next(error);
        }
    },

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const plan = await planService.update(req.user!.tenantId, String(req.params.id), req.body);
            res.json(plan);
        } catch (error) {
            next(error);
        }
    },

    async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const plan = await planService.toggleStatus(req.user!.tenantId, String(req.params.id));
            res.json(plan);
        } catch (error) {
            next(error);
        }
    }
};
