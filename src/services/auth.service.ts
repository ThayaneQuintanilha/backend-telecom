import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.model';
import { TenantModel } from '../models/Tenant.model';
import { AppError } from '../middlewares/errorHandler.middleware';
import { env } from '../config/env';

// ============================================================
// authService — Lógica de autenticação real com JWT + MongoDB
// ============================================================

interface LoginResult {
    user: {
        id: string;
        name: string;
        email: string;
        roleId: string;
        roleName: string;
        permissions: string[];
        tenantId: string;
        companyName: string;
        avatar?: string;
        active: boolean;
    };
    token: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResult> {
        // Buscar usuário com senha (select: false por padrão)
        const user = await UserModel.findOne({ email: email.toLowerCase() })
            .select('+password')
            .lean<any>();

        if (!user) {
            throw new AppError('E-mail ou senha incorretos', 401);
        }

        if (!user.active) {
            throw new AppError('Usuário inativo. Contate o administrador.', 401);
        }

        // Verificar senha
        const isMatch = await UserModel.findById(user._id).select('+password').then(async (u) => {
            if (!u) return false;
            return u.comparePassword(password);
        });

        if (!isMatch) {
            throw new AppError('E-mail ou senha incorretos', 401);
        }

        // Buscar dados do tenant
        const tenant = await TenantModel.findById(user.tenantId).lean();
        if (!tenant || !tenant.active) {
            throw new AppError('Empresa inativa ou não encontrada', 401);
        }

        // Atualizar lastLogin
        await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Gerar JWT
        const token = jwt.sign(
            { id: user._id.toString(), tenantId: user.tenantId.toString() },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as any }
        );

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                roleId: user.roleId.toString(),
                roleName: user.roleName,
                permissions: user.permissions,
                tenantId: user.tenantId.toString(),
                companyName: tenant.name,
                avatar: user.avatar,
                active: user.active,
            },
            token,
        };
    },

    async getMe(userId: string): Promise<LoginResult['user']> {
        const user = await UserModel.findById(userId).lean<any>();
        if (!user || !user.active) {
            throw new AppError('Usuário não encontrado', 404);
        }

        const tenant = await TenantModel.findById(user.tenantId).lean();
        if (!tenant) {
            throw new AppError('Empresa não encontrada', 404);
        }

        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            roleId: user.roleId.toString(),
            roleName: user.roleName,
            permissions: user.permissions,
            tenantId: user.tenantId.toString(),
            companyName: tenant.name,
            avatar: user.avatar,
            active: user.active,
        };
    },
};
