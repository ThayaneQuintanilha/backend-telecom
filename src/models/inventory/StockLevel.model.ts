import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStockLevel extends Document {
    tenantId: Types.ObjectId;
    locationType: 'Warehouse' | 'Storeroom' | 'User' | 'Customer';
    locationId: Types.ObjectId;
    productId: Types.ObjectId;
    quantity: number;
    lastCountDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const StockLevelSchema = new Schema<IStockLevel>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        locationType: {
            type: String,
            enum: ['Warehouse', 'Storeroom', 'User', 'Customer'],
            required: true
        },
        locationId: { type: Schema.Types.ObjectId, required: true },
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, default: 0 },
        lastCountDate: { type: Date },
    },
    { timestamps: true }
);

// Índice único para evitar duplicidade de registro de produto no mesmo local
StockLevelSchema.index({ tenantId: 1, locationType: 1, locationId: 1, productId: 1 }, { unique: true });

export const StockLevelModel = mongoose.model<IStockLevel>('StockLevel', StockLevelSchema);
