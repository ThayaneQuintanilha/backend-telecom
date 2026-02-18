import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/errorHandler.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import workOrderRoutes from './routes/workOrder.routes';

// ============================================================
// app.ts — Configuração do Express com todos os middlewares
// ============================================================

const app = express();

// ── Middlewares globais ──────────────────────────────────────
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        env: env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ── Rotas da API ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/work-orders', workOrderRoutes);

// ── 404 e Error Handler (SEMPRE por último) ──────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
