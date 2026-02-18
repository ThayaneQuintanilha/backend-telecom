import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================
// WorkOrder Model — Ordem de Serviço (multi-tenant)
// ============================================================

export type WorkOrderType =
    | 'installation'
    | 'maintenance'
    | 'address_change'
    | 'room_change'
    | 'removal'
    | 'inspection'
    | 'other';

export type WorkOrderStatus =
    | 'pending'
    | 'scheduled'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'on_hold';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface IChecklistItem {
    _id: Types.ObjectId;
    item: string;
    done: boolean;
    doneAt?: Date;
    doneBy?: Types.ObjectId;
}

export interface IEvidence {
    _id: Types.ObjectId;
    url: string;
    type: 'image' | 'video' | 'document';
    uploadedAt: Date;
    uploadedBy: Types.ObjectId;
}

export interface IAuditLog {
    _id: Types.ObjectId;
    action: string;
    by: Types.ObjectId;
    byName: string;
    at: Date;
    data?: Record<string, unknown>;
}

export interface IWorkOrder extends Document {
    tenantId: Types.ObjectId;
    code: string;
    type: WorkOrderType;
    status: WorkOrderStatus;
    priority: WorkOrderPriority;
    customerId: Types.ObjectId;
    locationId?: Types.ObjectId;
    locationAddress?: string;
    technicianId?: Types.ObjectId;
    teamId?: Types.ObjectId;
    planId?: Types.ObjectId;
    planSnapshot?: {
        name: string;
        downloadSpeed: number;
        uploadSpeed: number;
        price: number;
    };
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    checklist: IChecklistItem[];
    evidences: IEvidence[];
    notes?: string;
    history: IAuditLog[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>(
    {
        item: { type: String, required: true, trim: true },
        done: { type: Boolean, default: false },
        doneAt: { type: Date },
        doneBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { _id: true }
);

const EvidenceSchema = new Schema<IEvidence>(
    {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video', 'document'], required: true },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { _id: true }
);

const AuditLogSchema = new Schema<IAuditLog>(
    {
        action: { type: String, required: true },
        by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        byName: { type: String, required: true },
        at: { type: Date, default: Date.now },
        data: { type: Schema.Types.Mixed },
    },
    { _id: true }
);

const WorkOrderSchema = new Schema<IWorkOrder>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        code: { type: String, required: true },
        type: {
            type: String,
            enum: ['installation', 'maintenance', 'address_change', 'room_change', 'removal', 'inspection', 'other'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold'],
            default: 'pending',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        locationId: { type: Schema.Types.ObjectId },
        locationAddress: { type: String, trim: true },
        technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
        teamId: { type: Schema.Types.ObjectId },
        planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
        planSnapshot: {
            name: String,
            downloadSpeed: Number,
            uploadSpeed: Number,
            price: Number,
        },
        scheduledAt: { type: Date },
        startedAt: { type: Date },
        completedAt: { type: Date },
        checklist: [ChecklistItemSchema],
        evidences: [EvidenceSchema],
        notes: { type: String, trim: true },
        history: [AuditLogSchema],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

// Índices para queries frequentes
WorkOrderSchema.index({ tenantId: 1, status: 1 });
WorkOrderSchema.index({ tenantId: 1, customerId: 1 });
WorkOrderSchema.index({ tenantId: 1, technicianId: 1 });
WorkOrderSchema.index({ tenantId: 1, scheduledAt: 1 });
WorkOrderSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const WorkOrderModel = mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);

// Helper para gerar código sequencial por tenant
export async function generateWorkOrderCode(tenantId: Types.ObjectId): Promise<string> {
    const count = await WorkOrderModel.countDocuments({ tenantId });
    return `OS-${String(count + 1).padStart(5, '0')}`;
}
