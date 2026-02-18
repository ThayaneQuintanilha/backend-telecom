import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/telecom-sistem';

export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB conectado: ${MONGODB_URI}`);
    } catch (error) {
        console.error('❌ Falha ao conectar no MongoDB:', error);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB desconectado');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconectado');
});

export default mongoose;
