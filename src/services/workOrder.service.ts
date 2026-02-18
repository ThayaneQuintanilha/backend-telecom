import { WorkOrderModel, WorkOrderStatus, WorkOrderType, WorkOrderPriority } from '../models/WorkOrder.model';
import { AppError } from '../middlewares/errorHandler.middleware';
import { Types } from 'mongoose';

// ============================================================
// workOrderService — CRUD de OS com tenantId obrigatório
// ============================================================

interface ListWorkOrdersParams {
    tenantId: string;
    status?: WorkOrderStatus;
    type?: WorkOrderType;
    priority?: WorkOrderPriority;
    technicianId?: string;
    customerId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

interface CreateWorkOrderData {
    type: WorkOrderType;
    priority?: WorkOrderPriority;
    customerId: string;
    locationAddress?: string;
    technicianId?: string;
    scheduledAt?: string;
    notes?: string;
    checklist?: { item: string }[];
}

export const workOrderService = {
    async list({
        tenantId, status, type, priority, technicianId, customerId,
        dateFrom, dateTo, page = 1, limit = 20,
    }: ListWorkOrdersParams) {
        const filter: Record<string, unknown> = { tenantId: new Types.ObjectId(tenantId) };

        if (status) filter.status = status;
        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        if (technicianId) filter.technicianId = new Types.ObjectId(technicianId);
        if (customerId) filter.customerId = new Types.ObjectId(customerId);

        if (dateFrom || dateTo) {
            filter.scheduledAt = {
                ...(dateFrom && { $gte: new Date(dateFrom) }),
                ...(dateTo && { $lte: new Date(dateTo) }),
            };
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            WorkOrderModel.find(filter)
                .select('_id code type status priority customerId technicianId locationAddress scheduledAt createdAt')
                .populate('customerId', 'name')
                .populate('technicianId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WorkOrderModel.countDocuments(filter),
        ]);

        return {
            data: data.map((wo: any) => ({
                workOrderId: wo._id.toString(),
                code: wo.code,
                type: wo.type,
                status: wo.status,
                priority: wo.priority,
                customerId: wo.customerId?._id?.toString() || wo.customerId?.toString(),
                customerName: wo.customerId?.name || '',
                technicianId: wo.technicianId?._id?.toString(),
                technicianName: wo.technicianId?.name,
                address: wo.locationAddress || '',
                scheduledAt: wo.scheduledAt,
                createdAt: wo.createdAt,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    },

    async getById(tenantId: string, workOrderId: string) {
        const wo = await WorkOrderModel.findOne({
            _id: new Types.ObjectId(workOrderId),
            tenantId: new Types.ObjectId(tenantId),
        })
            .populate('customerId', 'name contacts addresses')
            .populate('technicianId', 'name email')
            .populate('createdBy', 'name')
            .lean();

        if (!wo) throw new AppError('Ordem de Serviço não encontrada', 404);
        return wo;
    },

    async create(tenantId: string, userId: string, userName: string, data: CreateWorkOrderData) {
        const wo = await WorkOrderModel.create({
            tenantId: new Types.ObjectId(tenantId),
            type: data.type,
            priority: data.priority || 'medium',
            customerId: new Types.ObjectId(data.customerId),
            locationAddress: data.locationAddress,
            technicianId: data.technicianId ? new Types.ObjectId(data.technicianId) : undefined,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            notes: data.notes,
            checklist: (data.checklist || []).map((c) => ({ item: c.item, done: false })),
            createdBy: new Types.ObjectId(userId),
            history: [{
                action: 'OS criada',
                by: new Types.ObjectId(userId),
                byName: userName,
                at: new Date(),
            }],
        });
        return wo;
    },

    async updateStatus(
        tenantId: string,
        workOrderId: string,
        status: WorkOrderStatus,
        userId: string,
        userName: string
    ) {
        const update: Record<string, unknown> = { status };
        if (status === 'in_progress') update.startedAt = new Date();
        if (status === 'completed') update.completedAt = new Date();

        const wo = await WorkOrderModel.findOneAndUpdate(
            { _id: new Types.ObjectId(workOrderId), tenantId: new Types.ObjectId(tenantId) },
            {
                $set: update,
                $push: {
                    history: {
                        action: `Status alterado para: ${status}`,
                        by: new Types.ObjectId(userId),
                        byName: userName,
                        at: new Date(),
                    },
                },
            },
            { new: true }
        );

        if (!wo) throw new AppError('Ordem de Serviço não encontrada', 404);
        return wo;
    },

    async updateChecklist(
        tenantId: string,
        workOrderId: string,
        itemId: string,
        done: boolean,
        userId: string
    ) {
        const wo = await WorkOrderModel.findOneAndUpdate(
            {
                _id: new Types.ObjectId(workOrderId),
                tenantId: new Types.ObjectId(tenantId),
                'checklist._id': new Types.ObjectId(itemId),
            },
            {
                $set: {
                    'checklist.$.done': done,
                    'checklist.$.doneAt': done ? new Date() : undefined,
                    'checklist.$.doneBy': done ? new Types.ObjectId(userId) : undefined,
                },
            },
            { new: true }
        );

        if (!wo) throw new AppError('Item de checklist não encontrado', 404);
        return wo;
    },
};
