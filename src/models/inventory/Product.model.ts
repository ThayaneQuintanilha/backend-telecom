import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Product Model — Catálogo de Produtos
// ============================================================

export interface IProduct extends Document {
    tenantId: Types.ObjectId;
    name: string;
    description?: string;
    partNumber?: string; // Código do fabricante/interno
    categoryId: Types.ObjectId;
    supplierId?: Types.ObjectId; // Fornecedor preferencial
    unit: 'un' | 'm' | 'kg' | 'l' | 'cx' | 'pc';
    minStock?: number; // Estoque mínimo para alerta
    costPrice?: number;
    salePrice?: number;
    images: string[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        partNumber: { type: String, trim: true },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
        unit: {
            type: String,
            enum: ['un', 'm', 'kg', 'l', 'cx', 'pc'],
            default: 'un',
        },
        minStock: { type: Number, default: 0 },
        costPrice: { type: Number },
        salePrice: { type: Number },
        images: [{ type: String }],
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

ProductSchema.index({ tenantId: 1, name: 1 });
ProductSchema.index({ tenantId: 1, partNumber: 1 });
ProductSchema.index({ tenantId: 1, categoryId: 1 });

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);
