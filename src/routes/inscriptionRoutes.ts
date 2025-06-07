// src/routes/inscriptionRoutes.ts
import { Router } from 'express';
import {
  createInscription,
  getInscriptions,
  getInscriptionsById,
  cancelInscription
} from '../controllers/InscriptionsController';
import { validateUserExists } from '../middlewares/user/validateUserExist';
import { validateEventExists } from '../middlewares/event/validateEventExist';
import { preventDuplicateInscription } from '../middlewares/event/preventDuplicateInscription';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inscriptions
 *   description: 'Endpoints para gerenciamento de inscrições/ingressos.'
 */

/**
 * @swagger
 * /inscription:
 *   post:
 *     tags: [Inscriptions]
 *     summary: 'Cria uma nova inscrição em um evento'
 *     description: 'Realiza a inscrição de um usuário em um evento Standard, gerando um ingresso com QR Code.'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InscriptionCreate'
 *     responses:
 *       201:
 *         description: 'Inscrição realizada com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Inscrição realizada com sucesso!'
 *                 inscription:
 *                   $ref: '#/components/schemas/Inscription'
 *       400:
 *         description: 'Dados inválidos (userId/eventId ausentes ou inválidos, campos de participante faltando).'
 *       404:
 *         description: 'Usuário ou evento não encontrado.'
 *       409:
 *         description: 'Participante já inscrito no evento.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.post(
  '/',
  validateUserExists,
  validateEventExists,
  preventDuplicateInscription,
  createInscription
);

/**
 * @swagger
 * /inscription:
 *   get:
 *     tags: [Inscriptions]
 *     summary: 'Lista todas as inscrições'
 *     description: 'Retorna uma lista de todas as inscrições/ingressos no sistema.'
 *     responses:
 *       200:
 *         description: 'Lista de inscrições retornada com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inscription'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.get('/', getInscriptions);

/**
 * @swagger
 * /inscription/{id}:
 *   get:
 *     tags: [Inscriptions]
 *     summary: 'Obtém uma inscrição pelo ID'
 *     description: 'Retorna os detalhes de uma inscrição/ingresso específico.'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID da inscrição/ingresso.'
 *     responses:
 *       200:
 *         description: 'Inscrição encontrada com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inscription'
 *       404:
 *         description: 'Inscrição não encontrada.'
 *       400:
 *         description: 'ID inválido.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.get('/:id', getInscriptionsById);

/**
 * @swagger
 * /inscription/{id}/cancel:
 *   patch:
 *     tags: [Inscriptions]
 *     summary: 'Cancela uma inscrição'
 *     description: 'Altera o status de uma inscrição para "EXPIRADO" e "NAO_COMPARECEU".'
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 'ID da inscrição a ser cancelada.'
 *     responses:
 *       200:
 *         description: 'Inscrição cancelada com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Inscrição cancelada/expirada com sucesso.'
 *                 inscription:
 *                   $ref: '#/components/schemas/Inscription'
 *       400:
 *         description: 'Ingresso já expirado ou usado, ou status inválido para cancelamento.'
 *       404:
 *         description: 'Inscrição não encontrada.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.patch('/:id/cancel', cancelInscription);

export default router;
