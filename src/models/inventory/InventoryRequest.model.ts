import mongoose, { Schema, Document, Types } from 'mongoose';

export type RequestType = 'RESTOCK' | 'DEPLOYMENT' | 'RETURN';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';

export interface IInventoryRequestItem {
    productId: Types.ObjectId;
    quantity: number;
    approvedQuantity?: number;
}

export interface IInventoryRequest extends Document {
    tenantId: Types.ObjectId;
    requesterId: Types.ObjectId;
    type: RequestType;
    status: RequestStatus;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';

    sourceLocationType?: string; // De onde vem (opcional na solicitação)
    sourceLocationId?: Types.ObjectId;

    targetLocationType: string; // Para onde vai
    targetLocationId: Types.ObjectId;

    items: IInventoryRequestItem[];
    notes?: string;

    approvedBy?: Types.ObjectId;
    approvedAt?: Date;

    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const InventoryRequestSchema = new Schema<IInventoryRequest>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['RESTOCK', 'DEPLOYMENT', 'RETURN'],
            required: true
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'],
            default: 'PENDING'
        },
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'MEDIUM'
        },
        sourceLocationType: String,
        sourceLocationId: Schema.Types.ObjectId,

        targetLocationType: String,
        targetLocationId: Schema.Types.ObjectId,

        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true, min: 1 },
                approvedQuantity: Number
            }
        ],
        notes: String,
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const InventoryRequestModel = mongoose.model<IInventoryRequest>('InventoryRequest', InventoryRequestSchema);
