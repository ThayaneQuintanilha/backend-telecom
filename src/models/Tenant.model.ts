import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Tenant Model — Empresa/cliente do sistema (multi-tenant)
// ============================================================

export interface ITenant extends Document {
    name: string;
    email: string;
    phone?: string;
    logo?: string;
    plan: 'basic' | 'professional' | 'enterprise';
    active: boolean;
    settings: {
        timezone: string;
        currency: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, trim: true },
        logo: { type: String },
        plan: { type: String, enum: ['basic', 'professional', 'enterprise'], default: 'basic' },
        active: { type: Boolean, default: true },
        settings: {
            timezone: { type: String, default: 'America/Sao_Paulo' },
            currency: { type: String, default: 'BRL' },
        },
    },
    { timestamps: true }
);

export const TenantModel = mongoose.model<ITenant>('Tenant', TenantSchema);
