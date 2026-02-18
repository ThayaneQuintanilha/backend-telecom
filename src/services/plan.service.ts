import { PlanModel, IPlan, PlanType } from '../models/Plan.model';
import { Types } from 'mongoose';
import { AppError } from '../middlewares/errorHandler.middleware';

interface CreatePlanDTO {
    name: string;
    description?: string;
    type: PlanType;
    downloadSpeed: number;
    uploadSpeed: number;
    price: number;
    installationFee?: number;
    contractDuration?: number;
    active?: boolean;
}

interface UpdatePlanDTO extends Partial<CreatePlanDTO> { }

interface ListPlansParams {
    tenantId: string;
    active?: boolean;
    type?: PlanType;
    search?: string;
    page?: number;
    limit?: number;
}

export const planService = {
    async create(tenantId: string, data: CreatePlanDTO): Promise<IPlan> {
        const exists = await PlanModel.findOne({
            tenantId: new Types.ObjectId(tenantId),
            name: data.name
        });

        if (exists) {
            throw new AppError('Já existe um plano com este nome neste tenant', 400);
        }

        const plan = await PlanModel.create({
            ...data,
            tenantId: new Types.ObjectId(tenantId)
        });

        return plan;
    },

    async list({ tenantId, active, type, search, page = 1, limit = 50 }: ListPlansParams) {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };

        if (active !== undefined) query.active = active;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [plans, total] = await Promise.all([
            PlanModel.find(query)
                .sort({ active: -1, name: 1 })
                .skip(skip)
                .limit(limit),
            PlanModel.countDocuments(query)
        ]);

        return {
            plans,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    },

    async getById(tenantId: string, planId: string): Promise<IPlan> {
        const plan = await PlanModel.findOne({
            _id: new Types.ObjectId(planId),
            tenantId: new Types.ObjectId(tenantId)
        });

        if (!plan) throw new AppError('Plano não encontrado', 404);

        return plan;
    },

    async update(tenantId: string, planId: string, data: UpdatePlanDTO): Promise<IPlan> {
        const plan = await PlanModel.findOne({
            _id: new Types.ObjectId(planId),
            tenantId: new Types.ObjectId(tenantId)
        });

        if (!plan) throw new AppError('Plano não encontrado', 404);

        // Check name uniqueness if name is changing
        if (data.name && data.name !== plan.name) {
            const exists = await PlanModel.findOne({
                tenantId: new Types.ObjectId(tenantId),
                name: data.name,
                _id: { $ne: plan._id }
            });

            if (exists) {
                throw new AppError('Já existe outro plano com este nome', 400);
            }
        }

        Object.assign(plan, data);
        await plan.save();

        return plan;
    },

    async toggleStatus(tenantId: string, planId: string): Promise<IPlan> {
        const plan = await PlanModel.findOne({
            _id: new Types.ObjectId(planId),
            tenantId: new Types.ObjectId(tenantId)
        });

        if (!plan) throw new AppError('Plano não encontrado', 404);

        plan.active = !plan.active;
        await plan.save();

        return plan;
    }
};
