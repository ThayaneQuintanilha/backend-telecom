import { VehicleModel, VehicleStatus } from '../models/Vehicle.model';
import { AppError } from '../middlewares/errorHandler.middleware';
import { Types } from 'mongoose';

// ============================================================
// vehicleService — CRUD de Frota com tenantId obrigatório
// ============================================================

interface ListVehiclesParams {
    tenantId: string;
    status?: VehicleStatus;
    search?: string;
    page?: number;
    limit?: number;
}

interface CreateVehicleData {
    plate: string;
    vehicleModel: string;
    brand: string;
    year: number;
    color?: string;
    fuelType?: string;
    mileage?: number;
    baseName?: string;
    notes?: string;
}

export const vehicleService = {
    async list({ tenantId, status, search, page = 1, limit = 20 }: ListVehiclesParams) {
        const filter: Record<string, unknown> = {
            tenantId: new Types.ObjectId(tenantId),
            active: true,
        };

        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { plate: { $regex: search, $options: 'i' } },
                { vehicleModel: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            VehicleModel.find(filter)
                .select('_id plate vehicleModel brand year color status mileage fuelType baseName active createdAt')
                .sort({ plate: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            VehicleModel.countDocuments(filter),
        ]);

        return {
            vehicles: data.map((v: any) => ({
                _id: v._id.toString(),
                plate: v.plate,
                vehicleModel: v.vehicleModel,
                brand: v.brand,
                year: v.year,
                color: v.color,
                status: v.status,
                mileage: v.mileage,
                fuelType: v.fuelType,
                baseName: v.baseName,
                active: v.active,
                createdAt: v.createdAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    },

    async getById(tenantId: string, vehicleId: string) {
        const vehicle = await VehicleModel.findOne({
            _id: new Types.ObjectId(vehicleId),
            tenantId: new Types.ObjectId(tenantId),
            active: true,
        }).lean();

        if (!vehicle) throw new AppError('Veículo não encontrado', 404);
        return vehicle;
    },

    async create(tenantId: string, data: CreateVehicleData) {
        const existing = await VehicleModel.findOne({
            tenantId: new Types.ObjectId(tenantId),
            plate: data.plate.toUpperCase(),
        });
        if (existing) throw new AppError('Já existe um veículo com essa placa', 409);

        const vehicle = await VehicleModel.create({
            tenantId: new Types.ObjectId(tenantId),
            plate: data.plate.toUpperCase(),
            vehicleModel: data.vehicleModel,
            brand: data.brand,
            year: data.year,
            color: data.color,
            fuelType: data.fuelType,
            mileage: data.mileage || 0,
            baseName: data.baseName,
            notes: data.notes,
            status: 'available',
        });
        return vehicle;
    },

    async updateStatus(tenantId: string, vehicleId: string, status: VehicleStatus) {
        const vehicle = await VehicleModel.findOneAndUpdate(
            { _id: new Types.ObjectId(vehicleId), tenantId: new Types.ObjectId(tenantId) },
            { $set: { status } },
            { new: true }
        );
        if (!vehicle) throw new AppError('Veículo não encontrado', 404);
        return vehicle;
    },

    async deactivate(tenantId: string, vehicleId: string) {
        const vehicle = await VehicleModel.findOneAndUpdate(
            { _id: new Types.ObjectId(vehicleId), tenantId: new Types.ObjectId(tenantId) },
            { $set: { active: false } },
            { new: true }
        );
        if (!vehicle) throw new AppError('Veículo não encontrado', 404);
        return vehicle;
    },
};
