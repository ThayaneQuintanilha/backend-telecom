import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// ============================================================
// MOCK AUTH — Substituir por JWT + MongoDB no futuro
// ============================================================

const MOCK_USER = {
    id: 'user-001',
    name: 'Empresa Demo',
    email: 'empresa@gmail.com',
    roleId: 'role-admin',
    roleName: 'Administrador',
    permissions: ['*'],
    tenantId: 'tenant-001',
    companyName: 'Telecom Ltda',
    active: true,
};

const MOCK_TOKEN = 'mock-jwt-token-empresa-demo-2024';

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (email === 'empresa@gmail.com' && password === 'empresa123') {
        return res.json({ user: MOCK_USER, token: MOCK_TOKEN });
    }

    return res.status(401).json({ message: 'Credenciais inválidas' });
});

app.get('/api/auth/me', (req, res) => {
    const auth = req.headers.authorization;
    if (auth === `Bearer ${MOCK_TOKEN}`) {
        return res.json(MOCK_USER);
    }
    return res.status(401).json({ message: 'Token inválido' });
});

app.post('/api/auth/logout', (_req, res) => {
    res.json({ message: 'Logout realizado' });
});

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✅ Backend rodando em http://localhost:${PORT}`);
    console.log(`   Mock login: empresa@gmail.com / empresa123`);
});

export default app;
