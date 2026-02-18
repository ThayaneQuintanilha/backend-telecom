import dotenv from 'dotenv';
dotenv.config();

import { env } from './config/env';
import { connectDatabase } from './config/database';
import app from './app';

// ============================================================
// server.ts — Entry point: conecta ao banco e sobe o servidor
// ============================================================

const start = async () => {
    try {
        // 1. Conectar ao MongoDB
        await connectDatabase();

        // 2. Subir o servidor HTTP
        app.listen(env.PORT, () => {
            console.log(`\n🚀 Backend rodando em http://localhost:${env.PORT}`);
            console.log(`   Ambiente: ${env.NODE_ENV}`);
            console.log(`   MongoDB: ${env.MONGODB_URI}`);
            console.log(`   Frontend: ${env.FRONTEND_URL}`);
            console.log(`\n📋 Endpoints disponíveis:`);
            console.log(`   POST /api/auth/login`);
            console.log(`   GET  /api/auth/me`);
            console.log(`   GET  /api/customers`);
            console.log(`   POST /api/customers`);
            console.log(`   GET  /api/work-orders`);
            console.log(`   POST /api/work-orders`);
            console.log(`   GET  /api/health\n`);
        });
    } catch (error) {
        console.error('❌ Falha ao iniciar o servidor:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM recebido. Encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⚠️  SIGINT recebido. Encerrando servidor...');
    process.exit(0);
});

start();
