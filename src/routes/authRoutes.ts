// src/routes/authRoutes.ts
import { Router } from 'express';
import { login, register } from '../controllers/AuthController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 'Endpoints para autenticação e registro de usuários.'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: 'Registra um novo usuário'
 *     description: 'Cria um novo usuário com todos os dados necessários.'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegister'
 *     responses:
 *       201:
 *         description: 'Cadastro realizado com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Cadastro realizado com sucesso!'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 'Erro de validação.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Erro de validação no cadastro'
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ['A senha deve conter ao menos 8 caracteres.']
 *       409:
 *         description: 'Conflito (e-mail ou CPF já em uso).'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'O campo \"email\" já está em uso.'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 'Realiza o login de um usuário'
 *     description: 'Autentica um usuário com e-mail e senha.'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLogin'
 *     responses:
 *       200:
 *         description: 'Login realizado com sucesso.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Login realizado com sucesso!'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 'Senha inválida.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Senha inválida'
 *       404:
 *         description: 'Usuário não encontrado.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Usuário não encontrado'
 *       500:
 *         description: 'Erro interno do servidor.'
 */
router.post('/login', login);

export default router;
