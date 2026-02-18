import mongoose, { Schema, Document, Types } from 'mongoose';

export type AssetStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DISPOSED' | 'LOST';

export interface IAsset extends Document {
    tenantId: Types.ObjectId;
    productId: Types.ObjectId;
    serialNumber: string; // Número de série do fabricante
    trackingCode?: string; // Código de patrimônio interno (etiqueta)
    status: AssetStatus;
    locationType: 'Warehouse' | 'Storeroom' | 'User' | 'Customer'; // Onde está?
    locationId: Types.ObjectId; // ID do local (Armazém, Técnico ou Cliente)
    notes?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        serialNumber: { type: String, required: true, trim: true },
        trackingCode: { type: String, trim: true },
        status: {
            type: String,
            enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DISPOSED', 'LOST'],
            default: 'AVAILABLE'
        },
        locationType: {
            type: String,
            enum: ['Warehouse', 'Storeroom', 'User', 'Customer'],
            required: true
        },
        locationId: { type: Schema.Types.ObjectId, required: true }, // Polimórfico na aplicação
        notes: { type: String, trim: true },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Índice composto para evitar serial duplicado dentro do mesmo tenant
AssetSchema.index({ tenantId: 1, serialNumber: 1 }, { unique: true });
// Índice para busca rápida por trackingCode
AssetSchema.index({ tenantId: 1, trackingCode: 1 });
AssetSchema.index({ tenantId: 1, productId: 1 });

export const AssetModel = mongoose.model<IAsset>('Asset', AssetSchema);
