import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { TenantModel } from '../models/Tenant.model';
import { UserModel } from '../models/User.model';
import { CustomerModel } from '../models/Customer.model';
import { env } from '../config/env';

// ============================================================
// seed.ts — Popula o banco com dados iniciais para desenvolvimento
// Uso: npx ts-node src/utils/seed.ts
// ============================================================

async function seed() {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB para seed');

    // Limpar dados existentes
    await Promise.all([
        TenantModel.deleteMany({}),
        UserModel.deleteMany({}),
        CustomerModel.deleteMany({}),
    ]);
    console.log('🗑️  Dados anteriores removidos');

    // Criar Tenant
    const tenant = await TenantModel.create({
        name: 'Telecom Ltda',
        email: 'empresa@gmail.com',
        phone: '(21) 99999-9999',
        plan: 'professional',
        active: true,
    });
    console.log(`✅ Tenant criado: ${tenant.name} (${tenant._id})`);

    // Criar Role ID fake (sem model de Role por ora)
    const fakeRoleId = new mongoose.Types.ObjectId();

    // Criar Usuário Admin
    const adminUser = await UserModel.create({
        tenantId: tenant._id,
        name: 'Administrador',
        email: 'empresa@gmail.com',
        password: 'empresa123',  // será hasheado pelo pre-save hook
        roleId: fakeRoleId,
        roleName: 'Administrador',
        permissions: ['*'],
        active: true,
    });
    console.log(`✅ Usuário criado: ${adminUser.email}`);

    // Criar Clientes de exemplo
    const customers = await CustomerModel.insertMany([
        {
            tenantId: tenant._id,
            name: 'João Silva',
            document: '123.456.789-00',
            contacts: [{ type: 'phone', value: '(21) 98765-4321', isPrimary: true }],
            addresses: [{
                label: 'Residência',
                street: 'Rua das Flores',
                number: '123',
                neighborhood: 'Centro',
                city: 'Niterói',
                state: 'RJ',
                zip: '24000-000',
                isPrimary: true,
            }],
            status: 'active',
        },
        {
            tenantId: tenant._id,
            name: 'Maria Oliveira',
            document: '987.654.321-00',
            contacts: [
                { type: 'phone', value: '(21) 91234-5678', isPrimary: true },
                { type: 'email', value: 'maria@email.com', isPrimary: false },
            ],
            addresses: [{
                label: 'Residência',
                street: 'Av. Principal',
                number: '456',
                neighborhood: 'Icaraí',
                city: 'Niterói',
                state: 'RJ',
                zip: '24230-000',
                isPrimary: true,
            }],
            status: 'active',
        },
        {
            tenantId: tenant._id,
            name: 'Carlos Santos',
            contacts: [{ type: 'whatsapp', value: '(21) 99876-5432', isPrimary: true }],
            addresses: [{
                label: 'Comercial',
                street: 'Rua do Comércio',
                number: '789',
                neighborhood: 'Maricá',
                city: 'Maricá',
                state: 'RJ',
                zip: '24900-000',
                isPrimary: true,
            }],
            status: 'active',
        },
    ]);
    console.log(`✅ ${customers.length} clientes criados`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('   Login: empresa@gmail.com / empresa123');
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
});
