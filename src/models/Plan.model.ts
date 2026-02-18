import mongoose, { Schema, Document, Types } from 'mongoose';

export enum PlanType {
    FTTH = 'FTTH',
    UTP = 'UTP',
    CORPORATIVO = 'CORPORATIVO',
    EQUIPAMENTO = 'EQUIPAMENTO',
}

export interface IPlan extends Document {
    tenantId: Types.ObjectId;
    name: string;
    description?: string;
    type: PlanType;
    downloadSpeed: number; // Mbps
    uploadSpeed: number; // Mbps
    price: number;
    installationFee?: number;
    contractDuration?: number; // months
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PlanSchema: Schema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: Object.values(PlanType), required: true },
    downloadSpeed: { type: Number, required: true, default: 0 },
    uploadSpeed: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, min: 0 },
    installationFee: { type: Number, default: 0 },
    contractDuration: { type: Number, default: 12 },
    active: { type: Boolean, default: true },
}, {
    timestamps: true
});

// Compound index to ensure unique names per tenant
PlanSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const PlanModel = mongoose.model<IPlan>('Plan', PlanSchema);
