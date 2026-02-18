import { Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { AuthRequest } from '../middlewares/auth.middleware';

// ============================================================
// customerController — Handlers HTTP para clientes
// ============================================================

export const customerController = {
    async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await customerService.list({
                tenantId: req.user!.tenantId,
                search: req.query.search ? String(req.query.search) : undefined,
                status: req.query.status ? (String(req.query.status) as 'active' | 'inactive') : undefined,
                page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
                limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 20,
            });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const customer = await customerService.getById(req.user!.tenantId, String(req.params.id));
            res.status(200).json(customer);
        } catch (error) {
            next(error);
        }
    },

    async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const customer = await customerService.create(req.user!.tenantId, req.body);
            res.status(201).json(customer);
        } catch (error) {
            next(error);
        }
    },

    async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const customer = await customerService.update(req.user!.tenantId, String(req.params.id), req.body);
            res.status(200).json(customer);
        } catch (error) {
            next(error);
        }
    },

    async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await customerService.delete(req.user!.tenantId, String(req.params.id));
            res.status(200).json({ message: 'Cliente desativado com sucesso' });
        } catch (error) {
            next(error);
        }
    },

    async updatePlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { planId } = req.body;
            if (!planId) {
                res.status(400).json({ message: 'planId é obrigatório' });
                return;
            }
            const customer = await customerService.updatePlan(req.user!.tenantId, String(req.params.id), planId);
            res.status(200).json(customer);
        } catch (error) {
            next(error);
        }
    },
};
