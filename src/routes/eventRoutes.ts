// src/routes/eventRoutes.ts
import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  validateEntry,
  validateExit,
  getEventsCreatedByUser,
  getEventDashboardData
} from '../controllers/EventController';
import { validateUserExists } from '../middlewares/user/validateUserExist';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Events
 *     description: 'Endpoints para gerenciamento de eventos (Standard).'
 *   - name: Event Access Control
 *     description: 'Endpoints para validação de entrada e saída de eventos.'
 */

/**
 * @swagger
 * /event:
 *   post:
 *     tags: [Events]
 *     summary: 'Cria um novo evento (Standard)'
 *     description: 'Cria um novo evento do tipo "standard" no sistema. O userId deve ser o ID do criador do evento.'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreate'
 *     responses:
 *       201:
 *         description: 'Evento criado com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: 'Dados inválidos (ex: userId ausente ou inválido, tipo de evento incorreto).'
 *       404:
 *         description: 'Usuário criador não encontrado.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.post('/', validateUserExists, createEvent);

/**
 * @swagger
 * /event:
 *   get:
 *     tags: [Events]
 *     summary: 'Lista todos os eventos'
 *     description: 'Retorna uma lista de todos os eventos criados.'
 *     responses:
 *       200:
 *         description: 'Lista de eventos retornada com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.get('/', getEvents);

/**
 * @swagger
 * /event/{id}:
 *   get:
 *     tags: [Events]
 *     summary: 'Obtém um evento pelo ID'
 *     description: 'Retorna os detalhes de um evento específico.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do evento.'
 *     responses:
 *       200:
 *         description: 'Evento encontrado com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: 'Evento não encontrado.'
 *       400:
 *         description: 'ID inválido.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.get('/:id', getEventById);

/**
 * @swagger
 * /event/{id}:
 *   patch:
 *     tags: [Events]
 *     summary: 'Edita um evento pelo ID (somente o criador)'
 *     description: 'Atualiza os dados de um evento existente. Apenas o usuário que criou o evento pode editá-lo.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do evento a ser atualizado.'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventUpdate'
 *     responses:
 *       200:
 *         description: 'Evento atualizado com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: 'Dados inválidos ou userId do criador ausente/inválido.'
 *       403:
 *         description: 'Você não tem permissão para editar este evento.'
 *       404:
 *         description: 'Evento não encontrado.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.patch('/:id', validateUserExists, updateEvent);

/**
 * @swagger
 * /event/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: 'Deleta um evento pelo ID (somente o criador)'
 *     description: 'Remove um evento do sistema. Apenas o usuário que criou o evento pode deletá-lo.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do evento a ser deletado.'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 'ID do usuário criador do evento (para validação de permissão)'
 *                 example: '60c8e23f1f7d5c001f3e0123'
 *     responses:
 *       200:
 *         description: 'Evento deletado com sucesso.'
 *       400:
 *         description: 'userId do criador ausente/inválido.'
 *       403:
 *         description: 'Você não tem permissão para deletar este evento.'
 *       404:
 *         description: 'Evento não encontrado.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.delete('/:id', validateUserExists, deleteEvent);

/**
 * @swagger
 * /event/validate-entry/{id}:
 *   post:
 *     tags: [Event Access Control]
 *     summary: 'Valida a entrada em um evento (check-in)'
 *     description: 'Valida o ingresso (QR Code) de um participante para check-in. Somente o criador do evento pode realizar esta validação.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do ingresso (lido do QR Code).'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventValidation'
 *     responses:
 *       200:
 *         description: 'Entrada validada com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Entrada validada com sucesso!'
 *                 inscription:
 *                   $ref: '#/components/schemas/Inscription'
 *       400:
 *         description: 'Ingresso inválido, já usado ou status incorreto.'
 *       403:
 *         description: 'Você não tem permissão para validar entradas deste evento.'
 *       404:
 *         description: 'Ingresso ou evento não encontrado.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.post('/validate-entry/:id', validateUserExists, validateEntry);

/**
 * @swagger
 * /event/validate-exit/{id}:
 *   post:
 *     tags: [Event Access Control]
 *     summary: 'Valida a saída de um evento (check-out)'
 *     description: 'Valida o ingresso (QR Code) de um participante para check-out. Somente o criador do evento pode realizar esta validação.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do ingresso (lido do QR Code).'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventValidation'
 *     responses:
 *       200:
 *         description: 'Saída validada com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Saída validada com sucesso!'
 *                 inscription:
 *                   $ref: '#/components/schemas/Inscription'
 *       400:
 *         description: 'Ingresso inválido, não fez entrada ou status incorreto.'
 *       403:
 *         description: 'Você não tem permissão para validar saídas deste evento.'
 *       404:
 *         description: 'Ingresso ou evento não encontrado.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.post('/validate-exit/:id', validateUserExists, validateExit);

/**
 * @swagger
 * /event/created-by/{userId}:
 *   get:
 *     tags: [Events]
 *     summary: 'Lista eventos criados por um usuário'
 *     description: 'Retorna todos os eventos criados por um usuário específico.'
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do usuário criador.'
 *     responses:
 *       200:
 *         description: 'Lista de eventos criados pelo usuário.'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       400:
 *         description: 'ID do usuário inválido.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.get('/created-by/:userId', validateUserExists, getEventsCreatedByUser);

/**
 * @swagger
 * /event/dashboard/{userId}:
 *   get:
 *     tags: [Event Dashboard]
 *     summary: 'Obtém dados de dashboard para eventos criados por um usuário'
 *     description: 'Retorna métricas agregadas (inscrições, participação, tempo médio) para todos os eventos criados por um usuário específico.'
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID do usuário criador dos eventos.'
 *     responses:
 *       200:
 *         description: 'Dados da dashboard retornados com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Nenhum evento encontrado criado por este usuário.'
 *                 dashboardData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       eventId:
 *                         type: string
 *                         description: 'ID do evento'
 *                       eventName:
 *                         type: string
 *                         description: 'Nome do evento'
 *                       totalInscriptions:
 *                         type: number
 *                         description: 'Número total de inscrições'
 *                       statusCounts:
 *                         type: object
 *                         properties:
 *                           approved:
 *                             type: number
 *                             description: 'Ingressos aprovados'
 *                           used:
 *                             type: number
 *                             description: 'Ingressos usados (check-in)'
 *                           expired:
 *                             type: number
 *                             description: 'Ingressos expirados/cancelados'
 *                       participationStatusCounts:
 *                         type: object
 *                         properties:
 *                           participating:
 *                             type: number
 *                             description: 'Pessoas atualmente participando'
 *                           participated:
 *                             type: number
 *                             description: 'Pessoas que já participaram e saíram'
 *                           notAttended:
 *                             type: number
 *                             description: 'Pessoas que não compareceram'
 *                           approved:
 *                             type: number
 *                             description: 'Pessoas com participação aprovada (aguardando check-in)'
 *                       averageTimeInMinutes:
 *                         type: number
 *                         format: float
 *                         description: 'Tempo médio de permanência no evento (minutos)'
 *       400:
 *         description: 'ID do usuário criador é obrigatório.'
 *       404:
 *         description: 'Usuário criador não encontrado.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.get('/dashboard/:userId', validateUserExists, getEventDashboardData);

export default router;
