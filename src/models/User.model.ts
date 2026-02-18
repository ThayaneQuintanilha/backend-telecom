import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

// ============================================================
// User Model — Usuário do sistema com multi-tenant
// ============================================================

export interface IUser extends Document {
    tenantId: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    roleId: Types.ObjectId;
    roleName: string;
    permissions: string[];
    avatar?: string;
    active: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
        roleName: { type: String, required: true },
        permissions: [{ type: String }],
        avatar: { type: String },
        active: { type: Boolean, default: true },
        lastLogin: { type: Date },
    },
    { timestamps: true }
);

// Índice único por tenant (email único por empresa)
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

// Hash da senha antes de salvar
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, env.BCRYPT_ROUNDS);
    next();
});

// Método para comparar senha
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
