import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// Storeroom Model — Almoxarifado (Estoque Secundário/Virtual)
// ============================================================

export interface IStoreroom extends Document {
    tenantId: Types.ObjectId;
    name: string;
    warehouseId: Types.ObjectId; // Vinculado a um armazém físico pai? (Opcional, regra de negócio)
    description?: string;
    responsibleId?: Types.ObjectId; // Usuário responsável
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StoreroomSchema = new Schema<IStoreroom>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, trim: true },
        warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
        description: { type: String, trim: true },
        responsibleId: { type: Schema.Types.ObjectId, ref: 'User' },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

StoreroomSchema.index({ tenantId: 1, name: 1 });

export const StoreroomModel = mongoose.model<IStoreroom>('Storeroom', StoreroomSchema);
