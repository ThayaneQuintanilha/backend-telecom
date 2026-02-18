import mongoose, { Schema, Document, Types } from 'mongoose';

export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';

export interface IInventoryMovement extends Document {
    tenantId: Types.ObjectId;
    type: MovementType;
    productId: Types.ObjectId;
    quantity: number;
    unitValue?: number; // Valor unitário no momento da movimentação

    sourceLocationType?: string;
    sourceLocationId?: Types.ObjectId;

    targetLocationType?: string;
    targetLocationId?: Types.ObjectId;

    referenceType?: 'Order' | 'Purchase' | 'InventoryCount' | 'Request' | 'Manual';
    referenceId?: Types.ObjectId | string;

    userId: Types.ObjectId; // Quem realizou
    notes?: string;
    createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        type: {
            type: String,
            enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN'],
            required: true
        },
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        quantity: { type: Number, required: true },
        unitValue: { type: Number },

        sourceLocationType: String,
        sourceLocationId: Schema.Types.ObjectId,

        targetLocationType: String,
        targetLocationId: Schema.Types.ObjectId,

        referenceType: {
            type: String,
            enum: ['Order', 'Purchase', 'InventoryCount', 'Request', 'Manual']
        },
        referenceId: Schema.Types.Mixed, // Pode ser ObjectId ou string

        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        notes: String,
    },
    { timestamps: true }
);

export const InventoryMovementModel = mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);
