import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKitItem {
    productId: Types.ObjectId;
    quantity: number;
}

export interface IKit extends Document {
    tenantId: Types.ObjectId;
    name: string;
    description?: string;
    items: IKitItem[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const KitSchema = new Schema<IKit>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        items: [
            {
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true, min: 1 }
            }
        ],
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

KitSchema.index({ tenantId: 1, name: 1 });

export const KitModel = mongoose.model<IKit>('Kit', KitSchema);
