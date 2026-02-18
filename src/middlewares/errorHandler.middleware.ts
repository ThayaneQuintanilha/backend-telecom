import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// ============================================================
// AppError — Classe de erro customizado com statusCode
// ============================================================
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// ============================================================
// errorHandler — Middleware centralizado de tratamento de erros
// ============================================================
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // Erros operacionais (AppError)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
        return;
    }

    // Erros do Mongoose — ID inválido
    if (err.name === 'CastError') {
        res.status(400).json({ status: 'error', message: 'ID inválido' });
        return;
    }

    // Erros do Mongoose — campo único duplicado
    if ((err as NodeJS.ErrnoException).code === '11000') {
        const field = Object.keys((err as any).keyValue || {})[0] || 'campo';
        res.status(409).json({
            status: 'error',
            message: `${field} já está em uso`,
        });
        return;
    }

    // Erros de validação do Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values((err as any).errors).map((e: any) => e.message);
        res.status(400).json({
            status: 'error',
            message: messages.join(', '),
        });
        return;
    }

    // Erro JWT
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ status: 'error', message: 'Token inválido' });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ status: 'error', message: 'Token expirado' });
        return;
    }

    // Erro desconhecido — não expor detalhes em produção
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({
        status: 'error',
        message: env.isDev() ? err.message : 'Erro interno do servidor',
        ...(env.isDev() && { stack: err.stack }),
    });
};

// ============================================================
// notFound — Handler para rotas não encontradas
// ============================================================
export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        status: 'error',
        message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    });
};
