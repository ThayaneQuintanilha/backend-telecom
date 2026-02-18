import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Customer Model — Cliente do sistema (multi-tenant)
// ============================================================

export interface ICustomerContact {
    type: 'phone' | 'email' | 'whatsapp';
    value: string;
    label?: string;
    isPrimary: boolean;
}

export interface ICustomerAddress {
    label: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
    lat?: number;
    lng?: number;
    isPrimary: boolean;
}

export interface ICustomer extends Document {
    tenantId: Types.ObjectId;
    name: string;
    document?: string;       // CPF ou CNPJ
    contacts: ICustomerContact[];
    addresses: ICustomerAddress[];
    status: 'active' | 'inactive';
    notes?: string;
    planId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema = new Schema<ICustomerContact>(
    {
        type: { type: String, enum: ['phone', 'email', 'whatsapp'], required: true },
        value: { type: String, required: true, trim: true },
        label: { type: String, trim: true },
        isPrimary: { type: Boolean, default: false },
    },
    { _id: true }
);

const AddressSchema = new Schema<ICustomerAddress>(
    {
        label: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        number: { type: String, required: true, trim: true },
        complement: { type: String, trim: true },
        neighborhood: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true, maxlength: 2 },
        zip: { type: String, required: true, trim: true },
        lat: { type: Number },
        lng: { type: Number },
        isPrimary: { type: Boolean, default: false },
    },
    { _id: true }
);

const CustomerSchema = new Schema<ICustomer>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, trim: true },
        document: { type: String, trim: true },
        contacts: [ContactSchema],
        addresses: [AddressSchema],
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        notes: { type: String, trim: true },
        planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    },
    { timestamps: true }
);

// Índices para busca eficiente
CustomerSchema.index({ tenantId: 1, name: 'text' });
CustomerSchema.index({ tenantId: 1, status: 1 });
CustomerSchema.index({ tenantId: 1, document: 1 });

export const CustomerModel = mongoose.model<ICustomer>('Customer', CustomerSchema);
