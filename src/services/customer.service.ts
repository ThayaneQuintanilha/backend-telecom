import { CustomerModel, ICustomer } from '../models/Customer.model';
import { AppError } from '../middlewares/errorHandler.middleware';
import { Types } from 'mongoose';

// ============================================================
// customerService — CRUD de clientes com tenantId obrigatório
// ============================================================

interface ListCustomersParams {
    tenantId: string;
    search?: string;
    status?: 'active' | 'inactive';
    page?: number;
    limit?: number;
}

interface CustomerFormData {
    name: string;
    document?: string;
    contacts?: ICustomer['contacts'];
    addresses?: ICustomer['addresses'];
    notes?: string;
}

export const customerService = {
    async list({ tenantId, search, status, page = 1, limit = 20 }: ListCustomersParams) {
        const filter: Record<string, unknown> = { tenantId: new Types.ObjectId(tenantId) };

        if (status) filter.status = status;

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { document: { $regex: search, $options: 'i' } },
                { 'contacts.value': { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            CustomerModel.find(filter)
                .select('_id name document contacts addresses status createdAt')
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            CustomerModel.countDocuments(filter),
        ]);

        return {
            customers: data.map((c: any) => ({
                _id: c._id.toString(),
                name: c.name,
                document: c.document,
                status: c.status,
                primaryPhone: c.contacts?.find((ct: any) => (ct.type === 'phone' || ct.type === 'whatsapp') && ct.isPrimary)?.value
                    || c.contacts?.find((ct: any) => ct.type === 'phone' || ct.type === 'whatsapp')?.value
                    || undefined,
                primaryEmail: c.contacts?.find((ct: any) => ct.type === 'email')?.value || undefined,
                primaryCity: c.addresses?.find((a: any) => a.isPrimary)?.city
                    || c.addresses?.[0]?.city
                    || undefined,
                createdAt: c.createdAt,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    },

    async getById(tenantId: string, customerId: string) {
        const customer = await CustomerModel.findOne({
            _id: new Types.ObjectId(customerId),
            tenantId: new Types.ObjectId(tenantId),
        }).lean();

        if (!customer) throw new AppError('Cliente não encontrado', 404);
        return customer;
    },

    async create(tenantId: string, data: CustomerFormData) {
        const customer = await CustomerModel.create({
            tenantId: new Types.ObjectId(tenantId),
            ...data,
        });
        return customer;
    },

    async update(tenantId: string, customerId: string, data: Partial<CustomerFormData>) {
        const customer = await CustomerModel.findOneAndUpdate(
            { _id: new Types.ObjectId(customerId), tenantId: new Types.ObjectId(tenantId) },
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!customer) throw new AppError('Cliente não encontrado', 404);
        return customer;
    },

    async delete(tenantId: string, customerId: string) {
        const customer = await CustomerModel.findOneAndUpdate(
            { _id: new Types.ObjectId(customerId), tenantId: new Types.ObjectId(tenantId) },
            { $set: { status: 'inactive' } },
            { new: true }
        );

        if (!customer) throw new AppError('Cliente não encontrado', 404);
        return customer;
    },
};
