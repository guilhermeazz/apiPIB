// src/index.ts
import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db/mongoose';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import inscriptionRoutes from './routes/inscriptionRoutes';
import swaggerUi from 'swagger-ui-express'; // Importe swaggerUi
import swaggerSpec from './swagger'; // Importe a especificação do Swagger

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conecta ao banco de dados
connectDB();

// Configuração do Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-flattop.css', // Tema escuro
  customSiteTitle: 'EventPro API Simplificada - Docs',
}));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/inscription', inscriptionRoutes);

// Mensagem de boas-vindas
app.get('/', (req, res) => {
  res.send('API EventPro Simplificada está funcionando! Acesse a documentação em /api-docs');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Documentação disponível em http://localhost:${PORT}/api-docs`);
});