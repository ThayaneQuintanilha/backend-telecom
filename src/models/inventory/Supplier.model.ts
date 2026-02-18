import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Supplier Model — Fornecedores
// ============================================================

export interface ISupplier extends Document {
    tenantId: Types.ObjectId;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    document?: string; // CNPJ/CPF
    website?: string;
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

const SupplierSchema = new Schema<ISupplier>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, trim: true },
        contactName: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        phone: { type: String, trim: true },
        document: { type: String, trim: true },
        website: { type: String, trim: true },
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

SupplierSchema.index({ tenantId: 1, name: 1 });

export const SupplierModel = mongoose.model<ISupplier>('Supplier', SupplierSchema);
