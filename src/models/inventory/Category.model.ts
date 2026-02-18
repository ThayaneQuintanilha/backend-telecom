import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Category Model — Categorias de Produtos
// ============================================================

export interface ICategory extends Document {
    tenantId: Types.ObjectId;
    name: string;
    description?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

CategorySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
