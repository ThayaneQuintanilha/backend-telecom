import { Response, NextFunction } from 'express';
import { workOrderService } from '../services/workOrder.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { WorkOrderStatus } from '../models/WorkOrder.model';

// ============================================================
// workOrderController — Handlers HTTP para Ordens de Serviço
// ============================================================

export const workOrderController = {
    async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const q = req.query;
            const result = await workOrderService.list({
                tenantId: req.user!.tenantId,
                status: q.status ? (String(q.status) as WorkOrderStatus) : undefined,
                type: q.type ? (String(q.type) as any) : undefined,
                priority: q.priority ? (String(q.priority) as any) : undefined,
                technicianId: q.technicianId ? String(q.technicianId) : undefined,
                customerId: q.customerId ? String(q.customerId) : undefined,
                dateFrom: q.dateFrom ? String(q.dateFrom) : undefined,
                dateTo: q.dateTo ? String(q.dateTo) : undefined,
                page: q.page ? parseInt(String(q.page), 10) : 1,
                limit: q.limit ? parseInt(String(q.limit), 10) : 20,
            });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    },

    async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const wo = await workOrderService.getById(req.user!.tenantId, req.params.id);
            res.status(200).json(wo);
        } catch (error) {
            next(error);
        }
    },

    async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const wo = await workOrderService.create(
                req.user!.tenantId,
                req.user!.id,
                'Usuário', // TODO: buscar nome do usuário
                req.body
            );
            res.status(201).json(wo);
        } catch (error) {
            next(error);
        }
    },

    async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status } = req.body;
            const wo = await workOrderService.updateStatus(
                req.user!.tenantId,
                req.params.id,
                status as WorkOrderStatus,
                req.user!.id,
                'Usuário'
            );
            res.status(200).json(wo);
        } catch (error) {
            next(error);
        }
    },

    async updateChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { done } = req.body;
            const wo = await workOrderService.updateChecklist(
                req.user!.tenantId,
                req.params.id,
                req.params.itemId,
                done,
                req.user!.id
            );
            res.status(200).json(wo);
        } catch (error) {
            next(error);
        }
    },
};
