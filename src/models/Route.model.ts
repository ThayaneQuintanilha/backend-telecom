import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRouteStop {
    workOrderId: Types.ObjectId;
    order: number;
    completedAt?: Date;
    status: 'pending' | 'completed' | 'skipped';
}

export interface IRoute extends Document {
    tenantId: Types.ObjectId;
    code: string;
    status: 'draft' | 'planned' | 'in_progress' | 'completed' | 'cancelled';
    date: Date;
    vehicleId?: Types.ObjectId;
    technicianId?: Types.ObjectId;
    stops: IRouteStop[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const RouteStopSchema = new Schema<IRouteStop>({
    workOrderId: { type: Schema.Types.ObjectId, ref: 'WorkOrder', required: true },
    order: { type: Number, required: true },
    completedAt: { type: Date },
    status: { type: String, enum: ['pending', 'completed', 'skipped'], default: 'pending' }
}, { _id: false });

const RouteSchema = new Schema<IRoute>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    code: { type: String, required: true },
    status: {
        type: String,
        enum: ['draft', 'planned', 'in_progress', 'completed', 'cancelled'],
        default: 'draft'
    },
    date: { type: Date, required: true, default: Date.now },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    stops: [RouteStopSchema],
    notes: { type: String }
}, { timestamps: true });

RouteSchema.index({ tenantId: 1, date: 1 });
RouteSchema.index({ tenantId: 1, status: 1 });
RouteSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const RouteModel = mongoose.model<IRoute>('Route', RouteSchema);

export async function generateRouteCode(tenantId: Types.ObjectId): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await RouteModel.countDocuments({
        tenantId,
        createdAt: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
        }
    });
    return `RT-${dateStr}-${String(count + 1).padStart(3, '0')}`;
}
