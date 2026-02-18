import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { routeService } from '../services/route.service';

export const routeController = {
    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { status, date, technicianId, page, limit } = req.query;
            const result = await routeService.list({
                tenantId: req.user!.tenantId,
                status: status ? String(status) : undefined,
                date: date ? String(date) : undefined,
                technicianId: technicianId ? String(technicianId) : undefined,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const route = await routeService.getById(req.user!.tenantId, req.params.id);
            res.json(route);
        } catch (error) {
            next(error);
        }
    },

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const route = await routeService.create(
                req.user!.tenantId,
                req.user!.id,
                req.body
            );
            res.status(201).json(route);
        } catch (error) {
            next(error);
        }
    },

    async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const route = await routeService.updateStatus(
                req.user!.tenantId,
                req.params.id,
                req.body.status
            );
            res.json(route);
        } catch (error) {
            next(error);
        }
    }
};
