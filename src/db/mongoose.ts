// src/db/mongoose.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const { DB_USER, DB_PASSWORD, DB_CLUSTER, DB_NAME } = process.env;
    if (!DB_USER || !DB_PASSWORD || !DB_CLUSTER || !DB_NAME) {
      throw new Error('Missing required environment variables for database connection');
    }

    const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;
    const urlPattern = /^mongodb\+srv:\/\/[A-Za-z0-9]+:[A-Za-z0-9]+@([A-Za-z0-9.-]+)\/[A-Za-z0-9]+/;
    if (!urlPattern.test(uri)) {
      throw new Error('Invalid MongoDB connection URI');
    }

    await mongoose.connect(uri);
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      throw new Error('Failed to establish a connection to MongoDB');
    }

    console.log('Conectado ao MongoDB com sucesso!');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao conectar ao MongoDB:', error.message);
    } else {
      console.error('Erro ao conectar ao MongoDB:', error);
    }
    process.exit(1);
  }
};

export default connectDB;