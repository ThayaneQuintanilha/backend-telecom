import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel } from '../models/User.model';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        tenantId: string;
        roleId: string;
        permissions: string[];
    };
}

// ============================================================
// authenticate — Verifica JWT e injeta user na request
// ============================================================
export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token não fornecido' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            id: string;
            tenantId: string;
        };

        const user = await UserModel.findById(decoded.id)
            .select('_id tenantId roleId permissions active')
            .lean();

        if (!user || !user.active) {
            res.status(401).json({ message: 'Usuário inativo ou não encontrado' });
            return;
        }

        req.user = {
            id: user._id.toString(),
            tenantId: user.tenantId.toString(),
            roleId: user.roleId.toString(),
            permissions: user.permissions,
        };

        next();
    } catch {
        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};

// ============================================================
// authorize — Verifica permissão específica
// ============================================================
export const authorize = (...permissions: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ message: 'Não autenticado' });
            return;
        }

        const hasPermission =
            req.user.permissions.includes('*') ||
            permissions.some((p) => req.user!.permissions.includes(p));

        if (!hasPermission) {
            res.status(403).json({ message: 'Sem permissão para esta ação' });
            return;
        }

        next();
    };
};
