// src/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'EventPro API Simplificada',
    version: '1.0.0',
    description: 'Documentação da API simplificada para o EventPro, focada em cadastro/login e gerenciamento básico de eventos, sem autenticação JWT.',
  },
  servers: [
    {
      url: 'https://pi2025-1eventpro-production.up.railway.app/api', // ✅ CORREÇÃO AQUI: Adicione 'https://'
      description: 'Servidor Hospedado no Railway',
    },
    {
      url: 'http://localhost:3000/api', // Mantenha para desenvolvimento local
      description: 'Servidor de Desenvolvimento Local',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'lastname', 'email', 'password', 'dateOfBirth', 'cpf', 'phone'],
        properties: {
          _id: { type: 'string', readOnly: true, description: 'ID único do usuário' },
          name: { type: 'string', example: 'João' },
          lastname: { type: 'string', example: 'Silva' },
          email: { type: 'string', format: 'email', example: 'joao.silva@example.com' },
          password: { type: 'string', format: 'password', example: 'SenhaSegura123!' },
          dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
          cpf: { type: 'string', example: '123.456.789-00' },
          phone: { type: 'string', example: '+5511987654321' },
        },
      },
      Event: {
        type: 'object',
        required: ['userId', 'name', 'description', 'categories', 'date', 'location', 'capacity', 'schedules', 'inscriptionPrice'],
        properties: {
          _id: { type: 'string', readOnly: true, description: 'ID único do evento' },
          userId: { type: 'string', description: 'ID do usuário criador do evento' },
          name: { type: 'string', example: 'Conferência Tech 2025' },
          description: { type: 'string', example: 'Evento anual sobre as últimas tendências em tecnologia.' },
          categories: { type: 'array', items: { type: 'string' }, example: ['Tecnologia', 'Desenvolvimento'] },
          date: { type: 'string', format: 'date-time', example: '2025-10-26T09:00:00Z' },
          location: {
            type: 'object',
            properties: {
              address: { type: 'string', example: 'Av. Paulista, 1000' },
              city: { type: 'string', example: 'São Paulo' },
              state: { type: 'string', example: 'SP' },
              country: { type: 'string', example: 'Brasil' },
              additionalInfo: { type: 'string', example: 'Próximo ao metrô Consolação' },
            },
            required: ['address', 'city', 'state', 'country'],
          },
          capacity: {
            type: 'object',
            properties: {
              max: { type: 'number', example: 500, description: 'Capacidade máxima do evento' },
              current: { type: 'number', readOnly: true, description: 'Número atual de participantes' },
              total: { type: 'number', readOnly: true, description: 'Total de inscrições (ingressos)' },
            },
            required: ['max'],
          },
          schedules: {
            type: 'object',
            properties: {
              start: { type: 'string', format: 'date-time', example: '2025-10-26T09:00:00Z' },
              end: { type: 'string', format: 'date-time', example: '2025-10-26T18:00:00Z' },
            },
            required: ['start', 'end'],
          },
          type: { type: 'string', enum: ['standard'], readOnly: true, description: 'Tipo de evento (apenas "standard")' },
          inscriptionPrice: { type: 'number', example: 150.00, description: 'Preço de inscrição do evento' },
          entryQrCode: { type: 'string', readOnly: true, description: 'QR Code de entrada do evento' },
        },
      },
      Inscription: {
        type: 'object',
        required: ['userId', 'eventId', 'forAnotherOne', 'participants'],
        properties: {
          _id: { type: 'string', readOnly: true, description: 'ID único da inscrição/ingresso' },
          userId: { type: 'string', description: 'ID do usuário que fez a inscrição' },
          eventId: { type: 'string', description: 'ID do evento inscrito' },
          forAnotherOne: { type: 'boolean', description: 'True se a inscrição é para outra pessoa' },
          participants: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Maria Souza' },
              email: { type: 'string', format: 'email', example: 'maria.souza@example.com' },
              dateOfBirth: { type: 'string', format: 'date', example: '1995-03-15' },
              document: { type: 'string', example: '000.111.222-33' },
            },
            required: ['name', 'email', 'dateOfBirth', 'document'],
          },
          status: { type: 'string', enum: ['APROVADO', 'USADO', 'EXPIRADO'], default: 'APROVADO', description: 'Status do ingresso' },
          participation_status: { type: 'string', enum: ['APROVADO', 'PARTICIPANDO', 'PARTICIPADO', 'NAO_COMPARECEU'], default: 'APROVADO', description: 'Status da participação' },
          checkin: {
            type: 'object',
            properties: {
              in: { type: 'string', format: 'date-time', description: 'Horário de check-in' },
              out: { type: 'string', format: 'date-time', description: 'Horário de check-out' },
            },
          },
        },
      },
      InscriptionCreate: {
        type: 'object',
        required: ['userId', 'eventId', 'forAnotherOne'],
        properties: {
          userId: { type: 'string', description: 'ID do usuário que está fazendo a inscrição', example: '60c8e23f1f7d5c001f3e0123' },
          eventId: { type: 'string', description: 'ID do evento a ser inscrito', example: '60d0fe4f5b67d5001f3e0921' },
          forAnotherOne: { type: 'boolean', example: false, description: 'Indica se a inscrição é para outra pessoa' },
          participants: { $ref: '#/components/schemas/Inscription/properties/participants' },
        },
      },
      AuthRegister: {
        type: 'object',
        required: ['name', 'lastname', 'email', 'password', 'dateOfBirth', 'cpf', 'phone'],
        properties: {
          name: { type: 'string', example: 'Novo' },
          lastname: { type: 'string', example: 'Usuario' },
          email: { type: 'string', format: 'email', example: 'novo.usuario@example.com' },
          password: { type: 'string', format: 'password', example: 'MinhaSenhaForte!123' },
          dateOfBirth: { type: 'string', format: 'date', example: '1992-05-20' },
          cpf: { type: 'string', example: '111.222.333-44' },
          phone: { type: 'string', example: '+5521912345678' },
        },
      },
      AuthLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'joao.silva@example.com' },
          password: { type: 'string', format: 'password', example: 'SenhaSegura123!' },
        },
      },
      EventCreate: {
        type: 'object',
        required: ['userId', 'name', 'description', 'categories', 'date', 'location', 'capacity', 'schedules', 'inscriptionPrice'],
        properties: {
          userId: { type: 'string', description: 'ID do usuário criador do evento', example: '60c8e23f1f7d5c001f3e0123' },
          name: { type: 'string', example: 'Workshop de Node.js' },
          description: { type: 'string', example: 'Aprenda Node.js do zero ao deploy.' },
          categories: { type: 'array', items: { type: 'string' }, example: ['Programação', 'Backend'] },
          date: { type: 'string', format: 'date-time', example: '2025-11-15T10:00:00Z' },
          location: { $ref: '#/components/schemas/Event/properties/location' },
          capacity: { $ref: '#/components/schemas/Event/properties/capacity' },
          schedules: { $ref: '#/components/schemas/Event/properties/schedules' },
          inscriptionPrice: { type: 'number', example: 50.00 },
        },
      },
      EventUpdate: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'ID do usuário criador do evento (para validação de permissão)', example: '60c8e23f1f7d5c001f3e0123' },
          name: { type: 'string', example: 'Workshop de Node.js Avançado' },
          description: { type: 'string', example: 'Aprofundando em tópicos avançados de Node.js.' },
        },
      },
      EventValidation: {
        type: 'object',
        required: ['eventCreatorId'],
        properties: {
          eventCreatorId: { type: 'string', description: 'ID do usuário criador do evento (para validação de permissão)', example: '60c8e23f1f7d5c001f3e0123' },
        },
      },
    },
    securitySchemes: {
      // Não haverá 'bearerAuth' neste projeto simplificado sem JWT
    },
  },
};

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: swaggerDefinition,
  apis: [path.join(__dirname, 'routes', '*.ts')],
});

export default swaggerSpec;