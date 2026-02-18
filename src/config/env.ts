// Centraliza todas as variáveis de ambiente com validação
const required = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
    return value;
};

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3001', 10),
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/telecom-sistem',
    JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    isDev: () => env.NODE_ENV === 'development',
    isProd: () => env.NODE_ENV === 'production',
};
