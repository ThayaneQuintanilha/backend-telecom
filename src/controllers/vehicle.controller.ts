import { Response, NextFunction } from 'express';
import { vehicleService } from '../services/vehicle.service';
import { AuthRequest } from '../middlewares/auth.middleware';

// ============================================================
// vehicleController — Endpoints de Frota
// ============================================================

export const vehicleController = {
    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const { status, search, page, limit } = req.query;

            const result = await vehicleService.list({
                tenantId,
                status: status as any,
                search: search as string,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 20,
            });

            res.json(result);
        } catch (err) {
            next(err);
        }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const vehicle = await vehicleService.getById(tenantId, req.params.id as string);
            res.json(vehicle);
        } catch (err) {
            next(err);
        }
    },

    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const vehicle = await vehicleService.create(tenantId, req.body);
            res.status(201).json(vehicle);
        } catch (err) {
            next(err);
        }
    },

    async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const { status } = req.body;
            const vehicle = await vehicleService.updateStatus(tenantId, req.params.id as string, status);
            res.json(vehicle);
        } catch (err) {
            next(err);
        }
    },

    async deactivate(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            await vehicleService.deactivate(tenantId, req.params.id as string);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
};
