import mongoose, { Schema, Document, Types } from 'mongoose';

export type CountStatus = 'DRAFT' | 'OPEN' | 'COMPLETED' | 'CANCELLED';

export interface IInventoryCountItem {
    productId: Types.ObjectId;
    currentStock: number; // Estoque sistema no momento da abertura
    countedStock?: number; // Estoque contado
    diff?: number;
    notes?: string;
}

export interface IInventoryCount extends Document {
    tenantId: Types.ObjectId;
    locationType: 'Warehouse' | 'Storeroom';
    locationId: Types.ObjectId;
    description: string;
    status: CountStatus;
    items: IInventoryCountItem[];
    responsibleId: Types.ObjectId;
    finalizedAt?: Date;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const InventoryCountSchema = new Schema<IInventoryCount>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        locationType: { type: String, enum: ['Warehouse', 'Storeroom'], required: true },
        locationId: { type: Schema.Types.ObjectId, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['DRAFT', 'OPEN', 'COMPLETED', 'CANCELLED'],
            default: 'DRAFT'
        },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                currentStock: { type: Number, default: 0 },
                countedStock: { type: Number },
                diff: { type: Number },
                notes: String
            }
        ],
        responsibleId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        finalizedAt: Date,
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const InventoryCountModel = mongoose.model<IInventoryCount>('InventoryCount', InventoryCountSchema);
