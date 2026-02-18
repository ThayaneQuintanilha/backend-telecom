import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Warehouse Model — Armazém (Estoque Principal)
// ============================================================

export interface IWarehouse extends Document {
    tenantId: Types.ObjectId;
    name: string;
    description?: string;
    address?: {
        street: string;
        number: string;
        complement?: string;
        district: string;
        city: string;
        state: string;
        zip: string;
    };
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        address: {
            street: String,
            number: String,
            complement: String,
            district: String,
            city: String,
            state: String,
            zip: String,
        },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

WarehouseSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const WarehouseModel = mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
