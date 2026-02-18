import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Vehicle Model — Frota (multi-tenant)
// ============================================================

export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'inactive';

export interface IVehicle extends Document {
    tenantId: Types.ObjectId;
    plate: string;
    vehicleModel: string;
    brand: string;
    year: number;
    color?: string;
    baseId?: string;        // Base/filial a que pertence
    baseName?: string;
    kitId?: Types.ObjectId; // Kit de equipamentos vinculado
    status: VehicleStatus;
    mileage?: number;
    fuelType?: 'gasoline' | 'ethanol' | 'flex' | 'diesel' | 'electric';
    notes?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        plate: { type: String, required: true, trim: true, uppercase: true },
        vehicleModel: { type: String, required: true, trim: true },
        brand: { type: String, required: true, trim: true },
        year: { type: Number, required: true },
        color: { type: String, trim: true },
        baseId: { type: String },
        baseName: { type: String },
        kitId: { type: Schema.Types.ObjectId, ref: 'Kit' },
        status: {
            type: String,
            enum: ['available', 'in_use', 'maintenance', 'inactive'],
            default: 'available',
        },
        mileage: { type: Number, default: 0 },
        fuelType: {
            type: String,
            enum: ['gasoline', 'ethanol', 'flex', 'diesel', 'electric'],
        },
        notes: { type: String, trim: true },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

VehicleSchema.index({ tenantId: 1, plate: 1 }, { unique: true });
VehicleSchema.index({ tenantId: 1, status: 1 });
VehicleSchema.index({ tenantId: 1, baseId: 1 });

export const VehicleModel = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
