import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.middleware';

// ============================================================
// validate — Middleware de validação usando schema simples
// Usa um objeto de regras para validar req.body
// ============================================================

type FieldRule = {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'email';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    enum?: (string | number)[];
};

type Schema = Record<string, FieldRule>;

const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validate = (schema: Schema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const errors: string[] = [];
        const body = req.body;

        for (const [field, rules] of Object.entries(schema)) {
            const value = body[field];
            const isEmpty = value === undefined || value === null || value === '';

            if (rules.required && isEmpty) {
                errors.push(`${field} é obrigatório`);
                continue;
            }

            if (isEmpty) continue;

            if (rules.type === 'email' && !isValidEmail(String(value))) {
                errors.push(`${field} deve ser um e-mail válido`);
            }

            if (rules.type === 'string' && typeof value !== 'string') {
                errors.push(`${field} deve ser texto`);
            }

            if (rules.type === 'number' && typeof value !== 'number') {
                errors.push(`${field} deve ser número`);
            }

            if (rules.minLength && String(value).length < rules.minLength) {
                errors.push(`${field} deve ter no mínimo ${rules.minLength} caracteres`);
            }

            if (rules.maxLength && String(value).length > rules.maxLength) {
                errors.push(`${field} deve ter no máximo ${rules.maxLength} caracteres`);
            }

            if (rules.min !== undefined && Number(value) < rules.min) {
                errors.push(`${field} deve ser no mínimo ${rules.min}`);
            }

            if (rules.max !== undefined && Number(value) > rules.max) {
                errors.push(`${field} deve ser no máximo ${rules.max}`);
            }

            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field} deve ser um de: ${rules.enum.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            next(new AppError(errors.join('; '), 400));
            return;
        }

        next();
    };
};
