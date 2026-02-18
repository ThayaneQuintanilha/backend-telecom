import { RouteModel, IRoute, generateRouteCode } from '../models/Route.model';
import { AppError } from '../middlewares/errorHandler.middleware';
import { Types } from 'mongoose';

interface CreateRouteData {
    date: string;
    vehicleId?: string;
    technicianId?: string;
    workOrderIds: string[];
    notes?: string;
}

interface ListRouteParams {
    tenantId: string;
    status?: string;
    date?: string;
    technicianId?: string;
    page?: number;
    limit?: number;
}

export const routeService = {
    async list({ tenantId, status, date, technicianId, page = 1, limit = 20 }: ListRouteParams) {
        const filter: any = { tenantId: new Types.ObjectId(tenantId) };
        if (status && status !== 'all') filter.status = status;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        }
        if (technicianId) filter.technicianId = new Types.ObjectId(technicianId);

        const skip = (page - 1) * limit;
        const [routes, total] = await Promise.all([
            RouteModel.find(filter)
                .populate('technicianId', 'name')
                .populate('vehicleId', 'plate model')
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            RouteModel.countDocuments(filter)
        ]);

        return {
            routes: routes.map((r: any) => ({
                ...r,
                totalStops: r.stops.length,
                completedStops: r.stops.filter((s: any) => s.status === 'completed').length,
                technicianName: r.technicianId?.name,
                vehiclePlate: r.vehicleId?.plate
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    },

    async getById(tenantId: string, id: string) {
        const route = await RouteModel.findOne({
            _id: new Types.ObjectId(id),
            tenantId: new Types.ObjectId(tenantId)
        })
            .populate('technicianId', 'name')
            .populate('vehicleId', 'plate model')
            .populate({
                path: 'stops.workOrderId',
                select: 'code type priority customerId locationAddress status',
                populate: { path: 'customerId', select: 'name addresses' }
            })
            .lean();

        if (!route) throw new AppError('Rota não encontrada', 404);
        return route;
    },

    async create(tenantId: string, userId: string, data: CreateRouteData) {
        const tenantObjectId = new Types.ObjectId(tenantId);
        const code = await generateRouteCode(tenantObjectId);

        const stops = data.workOrderIds.map((woId, index) => ({
            workOrderId: new Types.ObjectId(woId),
            order: index + 1,
            status: 'pending'
        }));

        const route = await RouteModel.create({
            tenantId: tenantObjectId,
            code,
            date: new Date(data.date),
            vehicleId: data.vehicleId ? new Types.ObjectId(data.vehicleId) : undefined,
            technicianId: data.technicianId ? new Types.ObjectId(data.technicianId) : undefined,
            stops,
            notes: data.notes,
            status: 'draft'
        });

        return route;
    },

    async updateStatus(tenantId: string, id: string, status: string) {
        const route = await RouteModel.findOneAndUpdate(
            { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
            { $set: { status } },
            { new: true }
        );
        if (!route) throw new AppError('Rota não encontrada', 404);
        return route;
    }
};
